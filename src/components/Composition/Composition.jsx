/* eslint-disable prettier/prettier */
import { useEffect, useRef, useState } from "react"
import Regleta from "../Regleta/Regleta";
import Audio from "../../components/Audio/Audio"


import css from "./style.module.css"

import { ObserverRaw } from "../../utilities/ObserverEvent";

import { useContextEditor } from "../../provider/ProviderEditor";
import { Iconify } from "../Iconify/Iconify";
import { pxPerSegment } from "../../models/values";
import Draggable from "../Draggeble/Draggable";


export default function Composition() {
   const { control, zoom, historyModal, loop } = useContextEditor()


   const [duration, setDuration] = useState(control.duration);
   const [scrollObserver] = useState(new ObserverRaw());
   const [audios, setAudios] = useState(control.audios);


   const refTimeLine = useRef(null)


   // listeners de control
   useEffect(() => {

      const subs$ = []

      subs$.push(control.addListenerEvent("CHANGE_AUDIOS", setAudios))
      subs$.push(control.addListenerEvent("CHANGE_DURATION", setDuration))


      return () => {
         control.audios = []
         subs$.forEach((sub) => sub.unsubscribe())
      }
   }, [])

   // cada vez que cambie el zoom, hay que cambiar el callback
   useEffect(() => {
      const updateTimeLine = (currentTime) => {
         if (refTimeLine.current) {
            refTimeLine.current.style.left = ((currentTime / zoom) * pxPerSegment) + "px"
         }
      }
      const sub = control.addListenerEvent("PLAYING", updateTimeLine)
      updateTimeLine(control.timeCurrent)

      return () => sub.unsubscribe()
   }, [zoom])

   // al terminar verifica si habitado la opcion de loop, si cambia el loop hay que cambiar de callback
   useEffect(() => {
      const sub = control.addListenerEvent("END_PLAYING", () => {
         // si esta vacio 
         if (loop && control.duration > 0) {
            // si lo ejecuto de inmediato no funcionara
            setTimeout(() => {
               control.timeCurrent = 0
               control.pause()
               control.play()
            }, 200)
         }
      })

      return () => {
         sub.unsubscribe()
      }
   }, [loop])



   return (
      <div className={css.container} onScroll={(e) => scrollObserver.emit(e.target.scrollLeft)} id="CompositionContainer">

         <div ref={refTimeLine} className={css.spacing_time_line}>
            <Draggable position={0} onChange={(nt)=>{control.timeCurrent+=nt}}>
               <div className={css.container_time_line}>
               <Iconify icon="pajamas:trend-down" size={25} />
               <div className={css.time_line} />
               </div>
            </Draggable>
         </div>
         <Regleta duration={duration} />
         {audios.map((aud) => <Audio key={aud.id} duration={duration} control={aud} ScrollObserver={scrollObserver} />)}
         {audios.length === 0 && <div className={css.banner_empty}>
            <div className={css.banner_empty_message}>
               <Iconify icon="wpf:audio-wave" size={30} />
               <p>No hay audios, Pero puedes añadirlos en la libreria</p>
            </div>
            <label>
               <button className={css.banner_empty_button} onClick={() => historyModal.addNewModal({ id: "root", name: "library" })}>
                  <Iconify icon="ph:books-duotone" size={25} />
                  <p>Abrir libreria</p>
               </button>
            </label>
         </div>}
      </div>
   )
}
