
import PropTypes from "prop-types"
import { useTabContext } from "./TabGroup"
ErrorTab.propTypes = {
   children: PropTypes.node,
}
export default function ErrorTab({ children }) {
   const { exists } = useTabContext()
   if (exists) return false
   return (
      <div>{children}</div>
   )
}
