import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { LeaderToggle as StoryComponent } from "./LeaderToggle.tsx";

const meta = {
  title: "Components/LeaderToggle",
  component: StoryComponent,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    isLeader: { control: "boolean" },
    isLeaderCompulsory: { control: "boolean" },
  },
  args: { handleToggle: fn() },
  decorators: (Story) => (
    <div style={{ width: "50ch" }}>
      <Story />
    </div>
  ),
} satisfies Meta<typeof StoryComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const On: Story = {
  args: {
    isLeader: true,
    isLeaderCompulsory: false,
  },
};

export const Off: Story = {
  args: {
    isLeader: false,
    isLeaderCompulsory: false,
  },
};

export const Compulsory: Story = {
  args: {
    isLeader: true,
    isLeaderCompulsory: true,
  },
};
