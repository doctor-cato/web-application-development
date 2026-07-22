/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  stories: [
    '../frontend/src/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../tests/stories/**/*.stories.@(js|jsx|ts|tsx|mdx)'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions'
  ],
  framework: {
    name: '@storybook/html-vite',
    options: {}
  },
  docs: {
    autodocs: 'tag'
  }
};

export default config;
