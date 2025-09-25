import { FaFolderOpen } from "react-icons/fa6";
import { icons } from "./icons.tsx";

export const GroupIcon = ({ icon }: { icon?: string }) => {
  if (!icon) {
    return <FaFolderOpen size={100} />;
  }

  const iconComponent = icons[icon];
  if (!iconComponent) {
    return <FaFolderOpen size={100} />;
  } else {
    return iconComponent;
  }
};
