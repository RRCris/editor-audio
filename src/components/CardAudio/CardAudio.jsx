import { useEffect, useRef, useState } from "react"
import { Iconify } from "../Iconify/Iconify"


import { AudioControl } from "../../utilities/controlAudioBuffer"

import css from "./style.module.css"
import PropTypes from "prop-types"
import { useContextEditor } from "../../provider/ProviderEditor"
CardAudio.propTypes = {
   title: PropTypes.string,
   audio: PropTypes.string,
   newAudio: PropTypes.bool,
}
export default function CardAudio({ title, audio, newAudio }) {
   const { control } = useContextEditor()
   const [open, setOpen] = useState(false)
   const [play, setPlay] = useState(false)
   const refAudio = useRef(null)
   const refBar = useRef(null)
   const refInput = useRef(null)
   useEffect(() => {
      const time = setInterval(() => {
         const current = refAudio.current?.currentTime || 1
         const duration = refAudio.current?.duration || 1
         const width = Math.floor((current / duration) * 100) + "%";
         refBar.current && (refBar.current.style.width = width)
      }, 100)

      return () => clearInterval(time)
   }, [])
   useEffect(() => {
      if (refAudio.current) {
         if (play) refAudio.current.play()
         else refAudio.current.pause()
      }
   }, [play])

   const onAdd = (audio) => {
      control.audios = [...control.audios, new AudioControl({ src: audio })]
   }
   const onNewAudio = () => {
      if (refInput.current) {
         refInput.current.click()
      }
   }
   const changeInput = (e) => {
      const file = e.target.files[0]
      console.log("file", file)
      control.audios = [...control.audios, new AudioControl({ src: file })]
   }

   if (!newAudio) return (
      <article className={css.container} onClick={!open ? () => setOpen(!open) : undefined}>

         <audio src={audio} ref={refAudio} onEnded={() => setPlay(false)} />
         <p className={css.titulo}>{title}</p>
         <Iconify icon="bx:music" size={45} />
         {open && <div className={css.container_hover}>
            <div style={{ width: "calc(100% - 10px)", height: 3, background: "var(--editor-back,#ccc)" }} >
               <div style={{ width: "50%", height: "100%", background: "var(--editor-primary,red)" }} ref={refBar} />
            </div>
            <div className={css.container_controls}>
               <Iconify icon={play ? "ic:round-pause" : "ph:play-fill"} size={31} onClick={() => setPlay(!play)} />

               <Iconify icon="carbon:add-filled" size={32} onClick={() => onAdd(audio)} />

               <Iconify icon="ci:exit" size={32} onClick={() => { setOpen(!open); setPlay(false) }} />
            </div>

         </div>}
      </article>
   )

   return (<article className={css.container} style={{ color: "#FFF", backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%23333' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")` }} onClick={onNewAudio}>
      <Iconify icon="mdi:add-bold" size={45} />
      <input type="file" hidden ref={refInput} onChange={changeInput} />
   </article>)
}
