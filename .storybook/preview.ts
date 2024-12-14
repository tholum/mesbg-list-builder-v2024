import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      inlineStories: true, // Display stories inline with the docs
      iframeHeight: 500, // Customize iframe height for preview
    },
    storySort: {
      order: [
        "Introduction",
        "How To Storybook",
        "Components",
        "Modals",
        "Alerts",
        "Sidebars",
      ],
    },
  },
  tags: ["autodocs"],
};

export default preview;
