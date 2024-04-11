import { createContext, useContext, useState } from 'react'
import { CompositionControl } from "../utilities/controlComposition";
import { HistoryModal } from "../utilities/historyModals";


const defaultValues = {
   zoom: 1000,
   historyModal: new HistoryModal(),
   control: new CompositionControl(),
   loop: false,
   setZoom: console.log,
   setLoop: console.log

}

const context = createContext(defaultValues)
export default function ProviderEditor({ children }) {
   const [value, setValue] = useState(defaultValues)

   const changeZoom = (zoom) => {
      setValue({ ...value, zoom })
   }

   const setLoop = (newLoop) => {
      setValue({ ...value, loop: newLoop })
   }
   value.setZoom = changeZoom
   value.setLoop = setLoop

   return (
      <context.Provider value={value}>{children}</context.Provider>
   )
}

export function useContextEditor() {
   return useContext(context)
}
