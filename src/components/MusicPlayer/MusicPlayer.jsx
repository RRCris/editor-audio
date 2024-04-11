import { useEffect, useRef, useState } from "react"
import { useContextEditor } from "../../provider/ProviderEditor"

import css from "./style.module.css"
import { Iconify } from "../Iconify/Iconify"
import { AudioControl } from "../../utilities/controlAudioBuffer"




export default function MusicPlayer() {
   const { control } = useContextEditor()

   const [audio, setAudio] = useState({ src: null, blob: null })
   const [playing, setPlaying] = useState(false)

   //para controlar el audio y sus controles
   const refAudioElement = useRef(null)
   //como la barra va a cambiar por cada  100 milisegundos, es mejor modificar el elemento directamente en ves re-renderizar
   const refBarPlaying = useRef(null)
   //va almacenar el id del time-interval(no uso un estado por que no requiere re-renderizado)
   const timerPlaying = useRef(null)




   // load audio from ControlComposition
   useEffect(() => {
      control.export().then((blob) => {
         const link = URL.createObjectURL(blob)
         setAudio({ src: link, blob })
      }).catch((err) => {

         if (control.duration === 0) console.log(`%c La composicion esta vacia, tiene que cargar por lo menos un archivo`, `background:blue; color:white`)
         else console.log(`%c ${err}`, `background:blue; color:white`)
      })
   }, [])

   const playElement = () => {
      if (refAudioElement.current && refBarPlaying.current) {
         if (playing) {
            setPlaying(false)
            refAudioElement.current.pause()
            timerPlaying.current && clearInterval(timerPlaying.current)


         } else {
            setPlaying(true)
            refAudioElement.current.play()
            const { currentTime, duration } = refAudioElement.current

            refBarPlaying.current.style.width = (currentTime / duration * 100) + "%"

            timerPlaying.current = setInterval(() => {
               const { currentTime, duration } = refAudioElement.current
               refBarPlaying.current.style.width = (currentTime / duration * 100) + "%"

            }, 100)
         }


      }
   }

   const exportAudio = () => {
      const fl = audio.src
      //download File
      const link = document.createElement("a");
      link.href = fl;
      link.download = crypto.randomUUID();
      link.click();
      URL.revokeObjectURL(fl);

   }
   const uploadActivity = () => {
     
}

   if (!audio.src) return <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <Iconify size={35} icon="ant-design:alert-twotone" />
      <p>Tienes que cargar por lo menos un audio para exportarlo</p>
   </div>

   const duration = AudioControl.formatTime((refAudioElement.current?.duration || 0) * 1000, ["M", "S"])

   return (
      <div className={css.container}>
         <p>{duration}</p>
         <div className={css.player}>
            <Iconify size={65} icon="cryptocurrency:music" />
         </div>
         <div className={css.bar__duration}>
            <div style={{ background: "var(--editor-primary)", height: 3 }} ref={refBarPlaying} />
         </div>
         <div className={css.controls_container}>
            <Iconify size={35} icon="solar:rewind-10-seconds-back-broken" onClick={() => refAudioElement.current.currentTime -= 1} />
            <Iconify size={35} icon={playing ? "gridicons:pause" : "carbon:play-filled"} onClick={playElement} />
            <Iconify size={35} icon="solar:rewind-10-seconds-forward-outline" onClick={() => refAudioElement.current.currentTime += 1} />
         </div>
         <button onClick={exportAudio} >Export </button>
         
         
         <audio src={audio.src || undefined} controls hidden ref={refAudioElement} onEnded={playElement} />
      </div>
   )
}
