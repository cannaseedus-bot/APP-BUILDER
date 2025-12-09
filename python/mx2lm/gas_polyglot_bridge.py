#!/usr/bin/env python3
"""
MX2LM GAS Polyglot Bridge - PI-GOAT Integration (SECURITY-GOAT Enabled)

Bridges Google Apps Script functions into POLYGOAT (MX2LM) architecture
with full XCFE + KUHUL polyglot support + SECURITY-GOAT validation.

Features:
- Execute GAS functions through KUHUL pipeline
- XCFE control vectors for GAS execution
- Polyglot language dispatch to GAS endpoints
- XJSON-formatted GAS responses
- Seal tracking for GAS runtimes
- HTTP request batching and caching
- SECURITY-GOAT malware/threat validation
"""

import json
import asyncio
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from datetime import datetime
import hashlib

try:
    import aiohttp
    AIOHTTP_AVAILABLE = True
except ImportError:
    AIOHTTP_AVAILABLE = False
    print("⚠️  aiohttp not available - install with: pip install aiohttp")

from checkpoint_manager import XCFEVectors, PolyglotRuntimeState

try:
    from gas_security_validator import SecurityGOAT, ValidationStatus
    SECURITY_AVAILABLE = True
except ImportError:
    SECURITY_AVAILABLE = False
    print("⚠️  SECURITY-GOAT not available - security validation disabled")


@dataclass
class GASEndpoint:
    """Google Apps Script endpoint configuration"""
    name: str
    url: str
    description: str
    functions: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    public: bool = True
    version: str = "1.0.0"
    author: str = "unknown"

    def to_xjson(self) -> Dict[str, Any]:
        """Export as XJSON"""
        return {
            "@context": "xjson://asxr/gas/endpoint/v1",
            "name": self.name,
            "url": self.url,
            "description": self.description,
            "functions": self.functions,
            "tags": self.tags,
            "public": self.public,
            "version": self.version,
            "author": self.author
        }


@dataclass
class GASRequest:
    """GAS HTTP request wrapper"""
    endpoint: str
    function: str
    params: Dict[str, Any] = field(default_factory=dict)
    method: str = "POST"

    def cache_key(self) -> str:
        """Generate cache key"""
        data = f"{self.endpoint}:{self.function}:{json.dumps(self.params, sort_keys=True)}"
        return hashlib.md5(data.encode()).hexdigest()


class GASPolyglotDispatcher:
    """
    Dispatch GAS functions through POLYGLOT architecture

    Supports language detection and routing:
    - [@language.gas] → Execute GAS function
    - [@language.javascript] → GAS with JS execution
    - [@language.python] → GAS with Python backend

    SECURITY-GOAT Integration:
    - Validates plugin code before registration
    - Validates runtime execution requests
    - Enforces threat thresholds
    """

    def __init__(self, enable_security: bool = True):
        self.endpoints: Dict[str, GASEndpoint] = {}
        self.cache: Dict[str, Any] = {}
        self.cache_ttl = 300  # 5 minutes
        self.enable_security = enable_security and SECURITY_AVAILABLE

        if self.enable_security:
            self.security = SecurityGOAT()
            print("🔒 SECURITY-GOAT enabled - all plugins will be validated")
        else:
            self.security = None
            print("⚠️  SECURITY-GOAT disabled - no security validation")

    def register_endpoint(self, endpoint: GASEndpoint, plugin_code: str = ""):
        """Register GAS endpoint with optional security validation"""

        # Security validation if enabled and code provided
        if self.enable_security and plugin_code:
            validation = self.security.validate_plugin(
                code=plugin_code,
                plugin_name=endpoint.name,
                author=endpoint.author
            )

            if validation.status == ValidationStatus.REJECTED:
                print(f"❌ REJECTED: {endpoint.name} - {validation.threat_level.name} threat detected")
                print(f"   Threats: {len(validation.threats)} found, score: {validation.score:.2f}")
                return False

            elif validation.status == ValidationStatus.QUARANTINED:
                print(f"⚠️  QUARANTINED: {endpoint.name} - requires manual review")
                print(f"   Threats: {len(validation.threats)} found, score: {validation.score:.2f}")
                # Store in quarantine but don't register
                self.security.quarantine_plugin(endpoint.name, plugin_code, validation)
                return False

            elif validation.status == ValidationStatus.NEEDS_REVIEW:
                print(f"⚠️  NEEDS REVIEW: {endpoint.name} - {validation.threat_level.name}")
                print(f"   Suspicious patterns: {len(validation.threats)} found, score: {validation.score:.2f}")
                # Allow but flag for review

        self.endpoints[endpoint.name] = endpoint

        if self.enable_security and plugin_code:
            print(f"✅ APPROVED & Registered: {endpoint.name} (security score: {validation.score:.2f})")
        else:
            print(f"✅ Registered GAS endpoint: {endpoint.name}")

        return True

    def detect_language(self, code: str) -> str:
        """Detect target language from KUHUL code"""
        if "[@language.gas]" in code or "gas-" in code:
            return "GAS"
        elif "[@language.javascript]" in code:
            return "JAVASCRIPT"
        elif "[@language.python]" in code:
            return "PYTHON"
        return "KUHUL"

    def parse_gas_call(self, code: str) -> Optional[GASRequest]:
        """Parse KUHUL code into GAS request"""
        # Example: [Pop gas-mx2lm-frontend-builder.generate]→[Wo params]→[Sek execute]

        if "gas-" not in code:
            return None

        # Extract GAS function name
        parts = code.split("gas-")
        if len(parts) < 2:
            return None

        func_part = parts[1].split("]")[0].split("→")[0].strip()
        endpoint_name, func_name = func_part.split(".", 1) if "." in func_part else (func_part, "doPost")

        return GASRequest(
            endpoint=f"gas-{endpoint_name}",
            function=func_name,
            params={},
            method="POST"
        )


class KUHULGASBridge:
    """
    KUHUL Pipeline Bridge for GAS Execution (SECURITY-GOAT Protected)

    Executes GAS functions through the enhanced KUHUL pipeline:
    SECURITY → POP → WO → SEK → XUL → CH'EN

    Stage 0: SECURITY - Validate runtime code with SECURITY-GOAT
    Stage 1: POP - Parse GAS call
    Stage 2: WO - Bind world state
    Stage 3: SEK - Execute GAS function
    Stage 4: XUL - Transform to XJSON
    Stage 5: CH'EN - Emit result
    """

    def __init__(self, dispatcher: GASPolyglotDispatcher):
        self.dispatcher = dispatcher
        self.xcfe = XCFEVectors(
            control_state={"gas_dispatch_enabled": True, "security_enabled": dispatcher.enable_security},
            flow_state={"pipeline_active": False},
            variable_state={}
        )
        self.polyglot = PolyglotRuntimeState(
            kuhul_active=True
        )
        self.enable_security = dispatcher.enable_security

    async def execute_through_pipeline(
        self,
        code: str,
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Execute GAS call through enhanced KUHUL pipeline with SECURITY-GOAT"""
        context = context or {}
        validation_result = None

        # Stage 0: SECURITY - Validate runtime code with SECURITY-GOAT
        if self.enable_security:
            self.xcfe.pipeline_stage = "security"
            validation_result = self.dispatcher.security.validate_plugin(
                code=code,
                plugin_name=context.get("plugin_name", "runtime"),
                author=context.get("author", "unknown")
            )

            # Reject if critical threat
            if validation_result.status == ValidationStatus.REJECTED:
                return {
                    "@context": "xjson://asxr/gas/security/rejected/v1",
                    "error": "SECURITY-GOAT rejected execution",
                    "validation": validation_result.to_xjson(),
                    "code": code,
                    "pipeline_stage": "security",
                    "timestamp": datetime.now().isoformat()
                }

            # Quarantine if high threat
            if validation_result.status == ValidationStatus.QUARANTINED:
                return {
                    "@context": "xjson://asxr/gas/security/quarantined/v1",
                    "error": "SECURITY-GOAT quarantined code for review",
                    "validation": validation_result.to_xjson(),
                    "code": code,
                    "pipeline_stage": "security",
                    "timestamp": datetime.now().isoformat()
                }

        # Stage 1: Pop - Parse GAS call
        self.xcfe.pipeline_stage = "pop"
        gas_request = self.dispatcher.parse_gas_call(code)

        if not gas_request:
            return {
                "error": "Invalid GAS call format",
                "code": code
            }

        # Stage 2: Wo - Bind world state
        self.xcfe.pipeline_stage = "wo"
        gas_request.params.update(context)

        # Stage 3: Sek - Execute GAS function
        self.xcfe.pipeline_stage = "sek"
        self.xcfe.language_active = "GAS"

        result = await self._execute_gas_request(gas_request)

        # Stage 4: Xul - Transform response to XJSON
        self.xcfe.pipeline_stage = "xul"
        xjson_result = self._transform_to_xjson(result, gas_request, validation_result)

        # Stage 5: Ch'en - Emit result
        self.xcfe.pipeline_stage = "chen"

        return xjson_result

    async def _execute_gas_request(self, request: GASRequest) -> Dict[str, Any]:
        """Execute HTTP request to GAS endpoint"""
        if not AIOHTTP_AVAILABLE:
            return {
                "error": "aiohttp not available",
                "simulation": True,
                "request": {
                    "endpoint": request.endpoint,
                    "function": request.function,
                    "params": request.params
                }
            }

        # Check cache
        cache_key = request.cache_key()
        if cache_key in self.dispatcher.cache:
            cached = self.dispatcher.cache[cache_key]
            if (datetime.now() - cached["timestamp"]).seconds < self.dispatcher.cache_ttl:
                return cached["data"]

        # Get endpoint
        endpoint = self.dispatcher.endpoints.get(request.endpoint)
        if not endpoint:
            return {"error": f"Endpoint not found: {request.endpoint}"}

        # Execute HTTP request
        try:
            async with aiohttp.ClientSession() as session:
                if request.method == "POST":
                    async with session.post(
                        endpoint.url,
                        json={
                            "function": request.function,
                            **request.params
                        }
                    ) as response:
                        data = await response.json()
                else:
                    async with session.get(
                        endpoint.url,
                        params=request.params
                    ) as response:
                        data = await response.json()

                # Cache result
                self.dispatcher.cache[cache_key] = {
                    "data": data,
                    "timestamp": datetime.now()
                }

                return data

        except Exception as e:
            return {
                "error": str(e),
                "endpoint": endpoint.url,
                "function": request.function
            }

    def _transform_to_xjson(
        self,
        result: Dict[str, Any],
        request: GASRequest,
        validation_result = None
    ) -> Dict[str, Any]:
        """Transform GAS response to XJSON format with security validation"""
        xjson = {
            "@context": "xjson://asxr/gas/response/v1",
            "@v": "3.2.0",
            "law": "SECURITY_VALIDATES → XCFE_GOVERNS → KUHUL_EXECUTES → GAS_DISPATCHES",

            "kuhul_pipeline": {
                "@law": "SECURITY → POP → WO → SEK → XUL → CH'EN",
                "@stage": self.xcfe.pipeline_stage,
                "@language": self.xcfe.language_active
            },

            "gas_request": {
                "endpoint": request.endpoint,
                "function": request.function,
                "params": request.params,
                "method": request.method
            },

            "gas_response": result,

            "xcfe_state": {
                "language_active": self.xcfe.language_active,
                "pipeline_stage": self.xcfe.pipeline_stage,
                "security_enabled": self.enable_security
            },

            "timestamp": datetime.now().isoformat()
        }

        # Add security validation if available
        if validation_result:
            xjson["security_validation"] = {
                "status": validation_result.status.name,
                "threat_level": validation_result.threat_level.name,
                "threat_score": validation_result.score,
                "threats_found": len(validation_result.threats),
                "details": validation_result.to_xjson()
            }

        return xjson


class GASXCFEValidator:
    """
    XCFE Control Flow Validator for GAS Execution

    Enforces causality and legal state transitions for GAS calls
    """

    def __init__(self):
        self.control_vectors = {
            "@if_gas_available": self._check_gas_available,
            "@loop_gas_batch": self._validate_batch,
            "@dispatch_safe": self._validate_dispatch,
            "@sync_gas_results": self._validate_sync
        }

    def _check_gas_available(self, endpoint: str) -> bool:
        """Check if GAS endpoint is available"""
        # In production, ping the endpoint
        return True

    def _validate_batch(self, requests: List[GASRequest]) -> bool:
        """Validate batch of GAS requests"""
        if len(requests) > 10:
            return False  # Limit batch size
        return True

    def _validate_dispatch(self, request: GASRequest) -> bool:
        """Validate GAS dispatch is safe"""
        # Check for required parameters
        if not request.endpoint or not request.function:
            return False
        return True

    def _validate_sync(self, results: List[Dict]) -> bool:
        """Validate synchronization of GAS results"""
        return all("error" not in r for r in results)

    def validate(self, vector: str, *args) -> bool:
        """Execute XCFE validation"""
        validator = self.control_vectors.get(vector)
        if not validator:
            return True
        return validator(*args)


# ============================================================
# USAGE EXAMPLE
# ============================================================

async def example_usage():
    """Example: Execute GAS through POLYGOAT with SECURITY-GOAT"""

    print("\n" + "=" * 70)
    print("EXAMPLE: SECURITY-GOAT Validation in Action")
    print("=" * 70)

    # Initialize dispatcher with SECURITY-GOAT enabled
    dispatcher = GASPolyglotDispatcher(enable_security=True)

    print("\n--- Example 1: Safe Plugin Registration ---\n")

    # Safe plugin code
    safe_plugin = """
    function doGet(e) {
        return ContentService.createTextOutput(JSON.stringify({
            message: "Hello from safe plugin",
            timestamp: new Date().toISOString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
    """

    dispatcher.register_endpoint(
        endpoint=GASEndpoint(
            name="gas-safe-plugin",
            url="https://script.google.com/macros/s/SAFE_ENDPOINT/exec",
            description="Safe example plugin",
            functions=["doGet"],
            tags=["safe", "example"],
            public=True,
            author="trusted_dev"
        ),
        plugin_code=safe_plugin
    )

    print("\n--- Example 2: Malicious Plugin Registration (will be rejected) ---\n")

    # Malicious plugin with eval()
    malicious_plugin = """
    function doPost(e) {
        eval(e.parameter.code);  // DANGEROUS!
        return ContentService.createTextOutput("executed");
    }
    """

    dispatcher.register_endpoint(
        endpoint=GASEndpoint(
            name="gas-malicious-plugin",
            url="https://script.google.com/macros/s/MALICIOUS_ENDPOINT/exec",
            description="Malicious plugin",
            functions=["doPost"],
            tags=["malicious"],
            public=True,
            author="unknown"
        ),
        plugin_code=malicious_plugin
    )

    print("\n--- Example 3: Register Production Endpoints ---\n")

    # Register production endpoints without code validation (already deployed)
    dispatcher.register_endpoint(GASEndpoint(
        name="gas-mx2lm-frontend-builder",
        url="https://script.google.com/macros/s/AKfycbyWBaO1s-y1LZizMkqcB8mHtbWEcgngj4-rwGHCLaC3N-No2pn1OzYOvzdH-c89p6DM/exec",
        description="MX2LM Frontend Builder",
        functions=["doGet", "doPost", "generateUI"],
        tags=["ui", "frontend", "builder"],
        public=True
    ))

    print("\n--- Example 4: Execute through KUHUL Pipeline ---\n")

    # Initialize bridge
    bridge = KUHULGASBridge(dispatcher)

    # Execute safe GAS call
    result = await bridge.execute_through_pipeline(
        code="[Pop gas-mx2lm-frontend-builder.generateUI]→[Wo params]→[Sek execute]",
        context={
            "prompt": "Build a dashboard with charts",
            "style": "modern",
            "theme": "dark",
            "author": "user_123"
        }
    )

    print("\n--- Execution Result ---\n")
    print(json.dumps(result, indent=2))

    print("\n" + "=" * 70)
    print("Security Validation Complete")
    print("=" * 70)


if __name__ == "__main__":
    print("=" * 70)
    print("MX2LM GAS Polyglot Bridge - PI-GOAT + SECURITY-GOAT")
    print("=" * 70)
    print()
    print("Features:")
    print("  ✅ KUHUL pipeline execution for GAS")
    print("  ✅ XCFE control flow validation")
    print("  ✅ Polyglot language dispatch")
    print("  ✅ XJSON-formatted responses")
    print("  ✅ HTTP request caching")
    print("  🔒 SECURITY-GOAT malware detection")
    print("  🔒 Plugin threat scoring (0.0-1.0)")
    print("  🔒 Quarantine & approval workflow")
    print()
    print("Enhanced Pipeline:")
    print("  SECURITY → POP → WO → SEK → XUL → CH'EN")
    print()
    print("Usage:")
    print("  from gas_polyglot_bridge import KUHULGASBridge, GASPolyglotDispatcher")
    print()

    # Run example
    if AIOHTTP_AVAILABLE and SECURITY_AVAILABLE:
        asyncio.run(example_usage())
    elif not AIOHTTP_AVAILABLE:
        print("⚠️  Install aiohttp to run example: pip install aiohttp")
    elif not SECURITY_AVAILABLE:
        print("⚠️  SECURITY-GOAT not available - check gas_security_validator.py")
