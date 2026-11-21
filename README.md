# Digital Nomad Spin

Source of [digitalnomadspin.com](https://www.digitalnomadspin.com): spin a 3D globe, compare cities and read guides for remote workers.

## Stack

- Vite, React 18, TypeScript
- Tailwind CSS, shadcn-ui
- react-three-fiber (globe)
- Supabase (auth, data)
- Vercel (hosting, deploys from `main`)

## Local development

```sh
bun install
bun run dev      # http://localhost:8080
bun run build    # production build + prerendered pages
bun run test     # unit tests
```

## Content

- City data: `src/data/cities/`
- Guides: `content/guides/*.md`
