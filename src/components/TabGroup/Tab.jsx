
import PropTypes from "prop-types"

import { useTabContext } from './TabGroup'
import { useEffect } from "react"
Tab.propTypes = {
   name: PropTypes.string,
   title: PropTypes.string,
   icon: PropTypes.string,
   children: PropTypes.node,
}
export default function Tab({ name, children }) {
   const { current } = useTabContext()

   if (current !== name) return false
   return (
      <div>{children}</div>
   )
}
