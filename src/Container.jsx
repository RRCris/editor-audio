import "./globalStyle.css";
import css from "./container.module.css"



// --------Components🧩

import Header from "./components/Header/Header";
import Composition from "./components/Composition/Composition";



//---------Hooks🔱
import { useEffect, useState } from "react";
import { useContextEditor } from "./provider/ProviderEditor";
import { useWidth } from "./hooks";
import { Iconify } from "./components/Iconify/Iconify";



export default function Container() {
  //--------Custom🚲
  const { watch } = useWidth("xl")
  const { historyModal } = useContextEditor()

  // -------Hooks🔱
  const [emptyModals, setEmptyModals] = useState(!historyModal.getLastModal());

  useEffect(() => {
    const sub = historyModal.change$.subscribe(last => {
      setEmptyModals(!Boolean(last))
    });

    //desmount
    return () => sub.unsubscribe();
  }, []);


  return (
    <div className={css.container}>


      <div
        className={css.container_editor}
      >
        <Header />
        <Composition />
      </div>
      {watch && <div id="modalPc" className={css.container__modal} >
        {emptyModals && <div className={css.banner_empty_modal}>
          <Iconify icon="ri:dashboard-horizontal-line" size={60} />
          <p>aqui vas a ver las herramientas</p>
        </div>}
      </div>}
    </div>
  );
}
