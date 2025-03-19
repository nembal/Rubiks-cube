Cursor Project Rules
To streamline development with Cursor, the following rules will be stored in the .cursor/rules directory. These rules use glob patterns and semantic descriptions to guide AI behavior, ensuring consistency and best practices across the project.
Setup Instructions
1. Create a .cursor/rules directory at the project root.
2. Add each rule below as a .rule file (e.g., general.rule).
3. Use Cmd + Shift + P > New Cursor Rule in Cursor to create additional rules later.
4. Reference external files (e.g., badmephisto content) with @attachment where applicable.
1. General Project Rule (.cursor/rules/general.rule)
json

{
  "description": "Default rules for the Rubik’s Cube Learning Application project.",
  "glob": "**/*",
  "context": [
    "@file:./rules/ui.rule",
    "@file:./rules/threejs.rule",
    "@file:./rules/education.rule",
    "@file:./rules/gamification.rule"
  ],
  "preferences": {
    "framework": "nextjs",
    "styling": "tailwindcss",
    "components": "shadcn",
    "performance": "optimize-for-60fps"
  }
}
* Purpose: Sets foundational preferences for the entire project, chaining other specific rules.
2. UI-Specific Rule (.cursor/rules/ui.rule)
json

{
  "description": "Rules for UI components using Tailwind CSS and ShadCN.",
  "glob": "**/*.jsx, **/*.tsx, **/components/**/*",
  "context": [
    "@file:./rules/general.rule"
  ],
  "preferences": {
    "style-guide": "consistent-utility-classes",
    "component-reuse": "prioritize-shadcn",
    "responsiveness": "mobile-first"
  },
  "examples": [
    "import { Button } from '@/components/ui/button';\n<Button className='bg-blue-500 text-white'>Solve</Button>"
  ]
}
* Purpose: Enforces UI consistency with Tailwind and ShadCN, focusing on reusable components.
3. Three.js Rule (.cursor/rules/threejs.rule)
json

{
  "description": "Rules for Three.js implementation of the 3D cube and backgrounds.",
  "glob": "**/threejs/**/*, **/*.js(threejs*)",
  "context": [
    "@file:./rules/general.rule"
  ],
  "preferences": {
    "rendering": "webgl2",
    "animation": "smooth-transitions",
    "optimization": "lod-techniques"
  },
  "examples": [
    "import * as THREE from 'three';\nconst scene = new THREE.Scene();\nconst cube = new THREE.Mesh(geometry, material);"
  ]
}
* Purpose: Guides Three.js usage for the cube, backgrounds, and performance optimization.
4. Educational Content Rule (.cursor/rules/education.rule)
json

{
  "description": "Rules for the 'Learn to Cube' section based on badmephisto content.",
  "glob": "**/education/**/*, **/tutorials/**/*",
  "context": [
    "@file:./rules/general.rule",
    "@attachment" // References badmephisto’s content (e.g., YouTube page)
  ],
  "preferences": {
    "content-source": "badmephisto-videos",
    "animation": "step-by-step",