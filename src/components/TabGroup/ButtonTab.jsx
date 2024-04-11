import PropTypes from "prop-types"

import { useTabContext } from "./TabGroup"
ButtonTab.propTypes = {
   to: PropTypes.string,
   children: PropTypes.node,
}
export default function ButtonTab({ to, children }) {
   const { changeCurrent } = useTabContext()
   return (
      <div onClick={() => changeCurrent(to)}>{children}</div>
   )
}
