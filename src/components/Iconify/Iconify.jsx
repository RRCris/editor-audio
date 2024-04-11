import PropTypes from "prop-types";
import { Icon } from "@iconify/react";

export function Iconify({ icon = "solar:home-line-duotone", size = 20, ...props }) {
   return (
      <Icon
         icon={icon}
         height={size}
         width={size}
         style={{ padding: 2, display: "flex", alignItems: "center" }}
         {...props}
      />
   );
}
Iconify.propTypes = {
   icon: PropTypes.string,
   size: PropTypes.number,
};
