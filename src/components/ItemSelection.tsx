import React from 'react'
import { V2 } from '../models/V2'
import {BarRefsAction} from './SelectionBar'

type ItemSelectionProps = {
  itemName: string,
  setBarRefs: any,
  itemsByGroup: any,
  refs: any
}

const ItemSelection: React.FC<ItemSelectionProps> = (props) => {
  const { itemName, setBarRefs, itemsByGroup, refs } = props

  const itemSelectRef = React.useRef<HTMLDivElement>(null);

  // React.useEffect(() => {
  //   if (itemSelectRef && itemSelectRef.current) {
  //     itemSelectRef.current.addEventListener("click", e => {
  //       e.stopPropagation()
  //       console.log(e.target)
  //       const collection = itemsByGroup[refs.current.selected];
  //       const newX = 200
  //       const newY = collection.length * 50
  //       setBarRefs(BarRefsAction.SET_BAR_TARGET_SIZE, { size: new V2(newX, newY) });
  //     })
  //   }
  // }, []) //eslint-disable-line

  const clickHandler = (e: any) => {
    if (itemSelectRef && itemSelectRef.current) {
        e.stopPropagation()
        console.log(e.target.parentElement.id)
        if (e.target.parentElement.id === 'Graph') {
          refs.current.selected = 'NODE'
        } else if (e.target.parentElement.id === 'Array') {
          refs.current.selected = 'LIST'
        }
        const collection = itemsByGroup[refs.current.selected];
        console.log(collection)
        const newX = 200
        const newY = (collection.length * 50) + 25
        setBarRefs(BarRefsAction.SET_BAR_TARGET_SIZE, { size: new V2(newX, newY) });
    }
  }

  return (
    <div className='itemSelection' id={itemName} ref={itemSelectRef} onClick={e => {clickHandler(e)}}>
      <p>{itemName}</p>
    </div>
  )
}

export default ItemSelection