# ⚡ ASX Studio Generator v3.0

XJSON-powered project scaffolding system for the ASXR Trinity ecosystem.

## Overview

The Studio Generator allows users to select from 8 different studio types and automatically generates complete project scaffolding using XJSON job templates.

## Studio Types

### 🌐 Web App Studio
Full-stack web application with:
- Micro-ASXR architecture
- Service worker for offline support
- MX2CMS database integration
- PWA manifest
- Hazard gold theme

### 🎮 Game Studio
Browser-based game development environment with:
- Canvas 2D rendering
- Game loop architecture
- Asset management system
- Physics-ready structure
- Multiplayer WebSocket support

### 🔌 API Studio
RESTful API server with:
- Express/FastAPI backend
- Database models
- Authentication system
- API documentation
- CORS configuration

### 📼 XJSON Tape Studio
Tape-based application using:
- K'UHUL 6-stage pipeline
- XCFE governance framework
- Atomic block execution
- Context variable resolution

### 🤖 AI Multi-Agent Studio
Multi-agent AI system with:
- 4 specialized agents (Orchestrator, Researcher, Executor, Validator)
- RLHF memory training
- MX2CMS integration
- Agent orchestration dashboard
- Task delegation system

### 🗄️ CMS Studio
Content management system with:
- Blog, Forum, E-commerce modes
- User management
- Plugin architecture
- WYSIWYG editor

### 📱 PWA Mobile Studio
Progressive Web App with:
- Offline-first architecture
- Push notifications
- App manifest
- Mobile-optimized UI
- Install prompts

### 👻 Terminal App Studio
Terminal-based application with:
- Command system
- REPL interface
- Shell integration
- History navigation

## Architecture

```
studio/
├── index.html              # Studio Generator UI
├── backend/
│   ├── __init__.py        # Package init
│   ├── api.py             # FastAPI server
│   └── xjson_engine.py    # XJSON execution engine
├── jobs/                   # XJSON job templates
│   ├── web-studio.xjson
│   ├── game-studio.xjson
│   ├── ai-multi-agent-studio.xjson
│   └── ...
└── README.md              # This file
```

## XJSON Job Format

XJSON jobs use a declarative format with atomic operations:

```json
{
  "@context": "ASXR-Trinity-Studio-Generator",
  "@v": "3.0.0",
  "@type": "web-studio",
  "@sequence": [
    {
      "@log": "Creating project: $input.name"
    },
    {
      "@mkdir": {
        "path": "projects/$input.name"
      }
    },
    {
      "@py.file.write": {
        "path": "projects/$input.name/index.html",
        "data": "..."
      }
    }
  ]
}
```

### Supported Operations

- `@log` - Log message to console
- `@mkdir` - Create directory
- `@py.file.write` - Write file
- `@py.file.read` - Read file
- `@py.exec` - Execute Python code
- `@py.jar` - Execute JAR file
- `@template` - Generate from template
- `@if` - Conditional execution
- `@sequence` - Sequential operations

## API Endpoints

### POST /api/studio/create
Create new studio project
```json
{
  "name": "MyProject",
  "description": "My awesome project",
  "type": "web"
}
```

### GET /api/studio/list-projects
List all generated studios

### GET /api/studio/templates
List available XJSON templates

### POST /api/xjson/run-job
Execute custom XJSON job
```json
{
  "job": "web-studio",
  "input": {
    "name": "MyApp",
    "description": "..."
  }
}
```

### POST /api/studio/import-github
Import GitHub repository as project
```json
{
  "repo_url": "https://github.com/user/repo",
  "project_name": "my-import"
}
```

## Integration with ASXR Trinity

The Studio Generator integrates with:

1. **MX2CMS** - All studio metadata stored in MX2DB scope `models`
2. **Ghost Shell** - Access via `studio` command
3. **Runtime Studio** - Generated projects can use Runtime Studio
4. **ASX Runtime** - All projects include `/public/asx-runtime.js`

## Usage

### Via Web UI

1. Navigate to `/studio/`
2. Enter studio name and description
3. Select studio type
4. Click "Generate Studio"
5. Project created at `/projects/{name}`

### Via Ghost Shell

```bash
$ studio create web MyApp "Description"
$ studio list
$ studio status MyApp
```

### Via ASX Runtime

```javascript
await window.ASX.createStudio('MyApp', 'Description', 'web');
await window.ASX.loadTapes();
```

## Variable Interpolation

XJSON templates support variable interpolation:

- `$input.name` - User input from form
- `$input.description` - Project description
- `$input.type` - Studio type
- `$ctx.key` - Context variables
- `{{timestamp}}` - Current timestamp

## K'UHUL Pipeline Integration

All generated studios support the K'UHUL 6-stage pipeline:

1. **SECURITY** - Input validation and sanitization
2. **POP** - Population of context
3. **WO** - Work orchestration
4. **SEK** - Sequence execution
5. **XUL** - eXecution and Update Logic
6. **CH'EN** - CHeck and ENd validation

## XCFE Governance

Studios follow XCFE (eXecution Control Flow Enforcement):

- `@control` - Control flow vectors
- `@flow` - Data flow tracking
- `@view` - View layer separation
- `@variable` - Variable scoping

## Development

### Running the Backend

```bash
cd studio/backend
python -m uvicorn api:app --reload --port 3001
```

### Creating Custom Templates

1. Create new XJSON file in `jobs/`
2. Define `@sequence` of operations
3. Use `$input` variables for user data
4. Test with `/api/xjson/run-job`

### Adding New Studio Type

1. Create XJSON template in `jobs/{type}-studio.xjson`
2. Update `type_map` in `backend/api.py`
3. Add option to `studio/index.html` select dropdown
4. Add description to `typeDescriptions` object

## Atomic Law

```
ASX = XCFE = XJSON = KUHUL = AST = MX2DB
```

All generated studios adhere to the atomic law of ASXR Trinity.

## Version

- **Engine**: v3.0.0
- **Architecture**: Micro-ASXR
- **Pipeline**: K'UHUL 6-stage
- **Governance**: XCFE
- **Format**: XJSON

---

Powered by **ASXR Trinity** ⚛️
