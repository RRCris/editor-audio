import PropTypes from "prop-types"
import css from "./tabStyle.module.css"
import { createContext, useContext, useState } from "react";
import { Iconify } from "../Iconify/Iconify"

//___________DefaultsValues🌄
const tabDefault = { name: "tab1", icon: "mingcute:ghost-fill", title: "Pestaña 1" }
const defaultValue = {
   current: "unnamed",
   exists: true,
   changeCurrent: console.log

}
//__________Contexts🌍
const contextTab = createContext(defaultValue);


//________Components🧩
export default function TabGroup({ children, defaultName, dataBase = [tabDefault] }) {
   const [tabCurrent, setTabCurrent] = useState(defaultName || dataBase[0].name || "unnamed")

   const contextValue = {
      current: tabCurrent,
      exists: dataBase.some((tab) => tab.name === tabCurrent),
      changeCurrent: setTabCurrent
   }

   const currentBarPosition = dataBase.findIndex((tab) => tab.name === tabCurrent)
   const percentPosition = 100 / dataBase.length

   return (
      <contextTab.Provider value={contextValue}>
         <div className={css.container_InfoTabs}>
            {dataBase?.map((tab) => <Pestania tab={tab} key={tab.name} />)}
            {currentBarPosition !== -1 && <div className={css.bar_tab} style={{ left: `calc(${percentPosition * currentBarPosition}% - 5px)`, width: `calc(${percentPosition}% + 5px)` }} />}
         </div>
         <div className={css.container_Tabs}>
            {children}
         </div>
      </contextTab.Provider>
   )
}

function Pestania({ tab = tabDefault }) {
   const { changeCurrent, current } = useTabContext()
   return <button onClick={() => changeCurrent(tab.name)} className={`${css.pestania_container} ${current === tab.name ? css.pestania_active : css.pestania_inactive}`}>
      <Iconify icon={tab.icon} size={23} />
      <p> {tab.title}</p>
   </button>
}
//________PropTypes💪
TabGroup.propTypes = {
   children: PropTypes.node,
   defaultName: PropTypes.string,
   dataBase: PropTypes.array
}
Pestania.propTypes = {
   tab: PropTypes.object

}

//________Hooks🦥
export const useTabContext = () => {
   const res = useContext(contextTab)
   if (!res) {
      console.warn("para utilizar el hook useTabContext deve ser dentro del componente TabGroup")
      return defaultValue
   }
   return res
}
