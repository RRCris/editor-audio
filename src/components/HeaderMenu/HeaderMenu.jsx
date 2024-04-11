import css from "./style.module.css"

export default function HeaderMenu({ children }) {
   return (
      <div className={css.container}>{children}</div>
   )
}
