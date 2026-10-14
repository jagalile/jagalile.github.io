# jagalile.github.io

Portfolio con todos mis proyectos de GitHub, hecho con [Astro](https://astro.build) y [Tailwind CSS](https://tailwindcss.com).

Los proyectos se leen automáticamente de la API de GitHub al compilar:

- **Etiquetas**: los *topics* del repositorio.
- **Descripción**: la descripción del repositorio (sección *About*).
- **Botón «Pruébalo»**: la *homepage* del repo, o un enlace a `jagalile.github.io/<repo>` que aparezca en el README.

Se excluyen los forks, los repos archivados y los que tengan el topic `no-portfolio`.

La web se publica en GitHub Pages con GitHub Actions en cada push a `main` y una vez al día, para recoger los cambios de los repos.

## Desarrollo

```sh
npm install
GITHUB_TOKEN=$(gh auth token) npm run dev   # el token es opcional, evita el límite de peticiones
```
