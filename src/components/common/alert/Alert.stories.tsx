import type { Meta, StoryObj } from "@storybook/react-vite";

import { fn } from "storybook/test";

import { CustomAlert } from "./CustomAlert.tsx";

const meta = {
  title: "Components/CustomAlert",
  component: CustomAlert,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    severity: { control: "select" },
    children: { control: "text" },
  },
  args: { onClose: fn() },
  decorators: (Story) => (
    <div style={{ width: "50ch" }}>
      <Story />
    </div>
  ),
} satisfies Meta<typeof CustomAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    title: "Informative",
    severity: "info",
    children: "This is informative text alert",
  },
};

export const Success: Story = {
  args: {
    title: "Success!",
    severity: "success",
    children: "This alert marks a successful operation.",
  },
};

export const Warning: Story = {
  args: {
    title: "Warning",
    severity: "warning",
    children: "This is a warning!",
  },
};

export const Error: Story = {
  args: {
    title: "Error!",
    severity: "error",
    children: "Something is not working!",
  },
};
