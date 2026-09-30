import { defineConfig } from 'astro/config';

const repository = process.env.GITHUB_REPOSITORY || '';
const repositoryName = repository.includes('/') ? repository.split('/')[1] : '';
const isGithubPages = Boolean(process.env.GITHUB_ACTIONS && repositoryName);

export default defineConfig({
  output: 'static',
  site: isGithubPages ? `https://${repository.split('/')[0]}.github.io` : undefined,
  base: isGithubPages ? `/${repositoryName}` : undefined,
  trailingSlash: 'always'
});
