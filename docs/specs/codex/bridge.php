<?php
// =============================================================
// bridge.php — ASX π Glyph Bridge Router (v2 CANONICAL)
// URL -> sanitized content -> ATOMIC JSON
// -> π world / bodies / constraints + ⟁tree
//
// ROLE: World Compiler Frontend ONLY
// - Emits initial conditions
// - NEVER advances time
// - NEVER applies forces
// - NEVER solves physics
// =============================================================

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// ------------------------ Helpers ------------------------

function jfail(int $code, array $obj): void {
  http_response_code($code);
  echo json_encode($obj, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
  exit;
}

function is_valid_url(string $u): bool {
  if (!filter_var($u, FILTER_VALIDATE_URL)) return false;
  $p = parse_url($u);
  if (!$p) return false;
  return in_array(strtolower($p['scheme'] ?? ''), ['http', 'https'], true);
}

function base_origin(string $u): string {
  $p = parse_url($u);
  return ($p['scheme'] ?? 'https') . '://' . ($p['host'] ?? '') . (isset($p['port']) ? ':' . $p['port'] : '');
}

function absolutize_url(string $maybe, string $base): string {
  $maybe = trim($maybe);
  if ($maybe === '') return '';
  if (preg_match('/^(https?:)?\/\//i', $maybe)) {
    return str_starts_with($maybe, '//') ? 'https:' . $maybe : $maybe;
  }
  if (str_starts_with($maybe, '#')) return $base . $maybe;
  if (str_starts_with($maybe, '/')) return $base . $maybe;
  return $base . '/' . ltrim($maybe, '/');
}

function bridge_url(string $absUrl, string $selfPath): string {
  return $selfPath . '?url=' . rawurlencode($absUrl);
}

function fetch_url(string $url, int $timeoutSec = 12): array {
  $ua = 'ASX-PI-Bridge/2.0 (+bridge.php)';
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_MAXREDIRS => 5,
      CURLOPT_CONNECTTIMEOUT => $timeoutSec,
      CURLOPT_TIMEOUT => $timeoutSec,
      CURLOPT_USERAGENT => $ua,
      CURLOPT_HEADER => true,
    ]);
    $raw = curl_exec($ch);
    if ($raw === false) {
      $err = curl_error($ch);
      curl_close($ch);
      return ['ok' => false, 'error' => $err];
    }
    $hdrSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    curl_close($ch);
    return [
      'ok' => true,
      'headers' => substr($raw, 0, $hdrSize),
      'body' => substr($raw, $hdrSize),
      'content_type' => curl_getinfo($ch, CURLINFO_CONTENT_TYPE)
    ];
  }

  $ctx = stream_context_create([
    'http' => [
      'method' => 'GET',
      'timeout' => $timeoutSec,
      'header' => "User-Agent: {$ua}\r\n",
      'ignore_errors' => true
    ]
  ]);
  $body = @file_get_contents($url, false, $ctx);
  if ($body === false) return ['ok' => false, 'error' => 'fetch_failed'];
  return ['ok' => true, 'body' => $body, 'content_type' => 'text/html'];
}

function sanitize_html(string $html): string {
  $html = preg_replace('/<script\b[^>]*>.*?<\/script>/is', '', $html) ?? $html;
  $html = preg_replace('/<iframe\b[^>]*>.*?<\/iframe>/is', '', $html) ?? $html;
  $html = preg_replace('/\son\w+\s*=\s*("|\').*?\1/i', '', $html) ?? $html;
  $html = preg_replace('/\s(href|src)\s*=\s*("|\')javascript:.*?\2/i', ' $1="#"', $html) ?? $html;
  return $html;
}

// ------------------------ Atomization ------------------------

function atomize_to_pi(string $html, string $originUrl, string $selfPath): array {
  $base = base_origin($originUrl);
  libxml_use_internal_errors(true);
  $doc = new DOMDocument();
  @$doc->loadHTML($html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

  $rewrite = [
    ['a','href'], ['img','src'], ['link','href'],
    ['form','action'], ['source','src']
  ];

  foreach ($rewrite as [$tag,$attr]) {
    foreach ($doc->getElementsByTagName($tag) as $n) {
      if (!$n->hasAttribute($attr)) continue;
      $v = trim($n->getAttribute($attr));
      if ($v === '' || preg_match('/^(mailto:|tel:|data:)/i', $v)) continue;
      $abs = absolutize_url($v, $base);
      $n->setAttribute($attr, bridge_url($abs, $selfPath));
      $n->setAttribute('data-asx', '@route');
    }
  }

  $bodies = [];
  $constraints = [];
  $maxNodes = 220;
  $count = 0;

  $inferRole = fn(DOMElement $el) =>
    in_array($el->tagName, ['a','button']) ? 'ui.action' :
    ($el->tagName === 'img' ? 'ui.media' : 'ui.node');

  $makeBody = function(string $role, string $domPath, string $asxId) {
    return [
      'id' => 'b' . hash('crc32b', $domPath),
      'mass' => $role === 'ui.action' ? 0.5 : 1.0,
      'position' => [0,0,0],
      'velocity' => [0,0,0],
      'rotation' => [0,0,0,1],
      'shape' => 'box',
      'size' => [1,1,0.1],
      'material' => ['friction'=>0.45,'restitution'=>0.08,'drag'=>0.02],
      'flags' => [],
      '@role' => $role,
      '@dom_key' => $asxId,
      '@bind_dom' => "[data-asx-id='{$asxId}']"
    ];
  };

  $walk = function($node) use (&$walk,&$bodies,&$count,$maxNodes,$inferRole,$makeBody) {
    if (!($node instanceof DOMElement) || $count >= $maxNodes) return null;
    $count++;

    $role = $inferRole($node);
    $asxId = $node->getAttribute('data-asx-id') ?: 'asx_' . $count;
    $node->setAttribute('data-asx-id', $asxId);

    $body = $makeBody($role, $node->getNodePath(), $asxId);
    $bodies[] = $body;

    $children = [];
    foreach ($node->childNodes as $ch) {
      $t = $walk($ch);
      if ($t) $children[] = $t;
    }

    $out = [
      '⟁node' => strtolower($node->tagName),
      '⟁role' => $role,
      '⟁id' => $asxId,
      '⟁children' => $children
    ];
    if ($node->tagName === 'a' && $node->hasAttribute('href')) {
      $out['@href'] = $node->getAttribute('href');
    }
    return $out;
  };

  $root = $doc->getElementsByTagName('body')->item(0) ?? $doc->documentElement;
  $treeChildren = [];
  foreach ($root->childNodes as $ch) {
    $t = $walk($ch);
    if ($t) $treeChildren[] = $t;
  }

  // Structural cohesion constraints ONLY (not interaction logic)
  for ($i = 0; $i + 1 < min(18, count($bodies)); $i++) {
    $constraints[] = [
      'id' => 'c' . $i,
      'type' => 'spring',
      'a' => $bodies[$i]['id'],
      'b' => $bodies[$i+1]['id'],
      'params' => ['rest_length'=>1,'stiffness'=>40,'damping'=>6]
    ];
  }

  return [
    'tree' => ['⟁node'=>'body','⟁children'=>$treeChildren],
    'bodies' => $bodies,
    'constraints' => $constraints
  ];
}

// ------------------------ Input ------------------------

$target = $_GET['url'] ?? '';
if ($target === '' || !is_valid_url($target)) {
  jfail(400, ["!error"=>"Invalid or missing url"]);
}

$selfPath = strtok($_SERVER['REQUEST_URI'] ?? '/bridge.php', '?');

// ------------------------ Fetch + Compile ------------------------

$f = fetch_url($target);
if (!$f['ok']) jfail(502, ["!error"=>"Fetch failed"]);

$raw = sanitize_html((string)$f['body']);
$isHtml = preg_match('/<html|<body|<!doctype/i', $raw);

$piWorld = [
  "gravity" => [0,9.81,0],
  "air" => ["density"=>1.225,"viscosity"=>0.000018],
  "time" => ["dt"=>0.0166667,"substeps"=>1],
  "solver" => ["integrator"=>"semi_implicit","iterations"=>8],
  "fields" => [] // REQUIRED kernel contract
];

$out = [
  "@type" => "ASX_PI_BUNDLE",
  "@origin" => $target,
  "*timestamp" => time(),
  "status" => "●",
  "%pi" => ["world"=>$piWorld,"bodies"=>[],"constraints"=>[]],
  "⟁tree" => ["⟁node"=>"body","⟁children"=>[]]
];

if ($isHtml) {
  $atom = atomize_to_pi($raw, $target, $selfPath);
  $out["%pi"]["bodies"] = $atom["bodies"];
  $out["%pi"]["constraints"] = $atom["constraints"];
  $out["⟁tree"] = $atom["tree"];
}

echo json_encode($out, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
