\
use scx2_fused_lane_ref::*;
use scx2_fused_lane_ref::rans;

fn default_ans() -> AnsCodec {
    // Minimal frequency model for demo: small symbol space 0..=1023 with uniform-ish freqs
    // In production, these freqs come from MX2⟁☣ governed registries & historical counts.
    let mut freqs: Vec<(u16,u32)> = Vec::new();
    for s in 0u16..512u16 {
        freqs.push((s, 1));
    }
    AnsCodec::from_freqs(&freqs).unwrap()
}

#[test]
fn fused_edges_roundtrip_bit_identity() {
    let ans = default_ans();

    let batch1 = vec![
        EdgeAst{ id: 1, from: 0, to: 2, kind: 1, weight_bits: f32::to_bits(0.5), flags: 0x0001_0002 },
        EdgeAst{ id: 2, from: 0, to: 3, kind: 0, weight_bits: f32::to_bits(0.25), flags: 0 },
        EdgeAst{ id: 3, from: 1, to: 0, kind: 2, weight_bits: f32::to_bits(1.0), flags: 0xFFFF_FFFF },
    ];
    let payload = build_edges_payload_fused(&batch1, &ans).unwrap();

    // decode then re-encode payload and enforce bit identity
    let decoded = read_edges_payload_fused(&payload, &ans).unwrap();
    assert_eq!(decoded.len(), batch1.len());

    let payload2 = build_edges_payload_fused(&decoded, &ans).unwrap();
    assert_eq!(payload, payload2);
}

#[test]
fn csr_builder_2pass_matches_edges() {
    let ans = default_ans();

    let batches = vec![
        vec![
            EdgeAst{ id: 1, from: 0, to: 2, kind: 1, weight_bits: f32::to_bits(0.5), flags: 0 },
            EdgeAst{ id: 2, from: 0, to: 3, kind: 0, weight_bits: f32::to_bits(0.25), flags: 0 },
        ],
        vec![
            EdgeAst{ id: 3, from: 1, to: 0, kind: 2, weight_bits: f32::to_bits(1.0), flags: 1 },
        ]
    ];

    let stream = build_stream_with_edges_and_meta(batches.clone(), &ans).unwrap();
    let meta = read_meta_from_stream(&stream).unwrap();
    let csr = build_csr_from_edges_batches(&stream, &meta, &ans, 4).unwrap();

    // node 0 should have 2 outgoing, node 1 should have 1 outgoing
    assert_eq!(csr.row_ptr[0], 0);
    assert_eq!(csr.row_ptr[1], 2);
    assert_eq!(csr.row_ptr[2], 3);

    let n0 = &csr.col_to[csr.row_ptr[0] as usize .. csr.row_ptr[1] as usize];
    assert_eq!(n0, &[2,3]);
    let n1 = &csr.col_to[csr.row_ptr[1] as usize .. csr.row_ptr[2] as usize];
    assert_eq!(n1, &[0]);

    // golden: bit identity on whole stream for decode->encode is not implemented (needs full stream encoder),
    // but we can enforce meta parse and batch payload roundtrips.
    // verify each batch payload bit identity
    for b in meta.batches.iter().filter(|b| b.kind=="E") {
        let ps = (b.start_offset + b.header_len) as usize;
        let pl = b.payload_len as usize;
        let payload = &stream[ps..ps+pl];
        let edges = read_edges_payload_fused(payload, &ans).unwrap();
        let rep = build_edges_payload_fused(&edges, &ans).unwrap();
        assert_eq!(payload, rep.as_slice());
    }
}
