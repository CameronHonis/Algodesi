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
 
  const clickHandler = (e: any) => {
    if (itemSelectRef && itemSelectRef.current) {
        e.stopPropagation()
        console.log(e)
        if (itemName === 'Graph') {
          refs.current.selected = 'NODE'
          const collection = itemsByGroup[refs.current.selected];
          const newX = 200
          const newY = (collection.length * 50) + 25
          setBarRefs(BarRefsAction.SET_BAR_TARGET_SIZE, { size: new V2(newX, newY) });
        } else if (itemName === 'Array') {
          refs.current.selected = 'LIST'
          const collection = itemsByGroup[refs.current.selected];
          const newX = 200
          const newY = (collection.length * 50) + 25
          setBarRefs(BarRefsAction.SET_BAR_TARGET_SIZE, { size: new V2(newX, newY) });
        }
    }
  }
  if (refs.current.selected !== 'NONE') {
    return (
      <div className='itemSelection' ref={itemSelectRef} onClick={e => {clickHandler(e)}}>
        <p className='itemSVG'>pic</p>
        <p className='itemName'>{itemName}</p>
      </div>
    )
  } else {
  return (
    <div className='itemSelection' ref={itemSelectRef} onClick={e => {clickHandler(e)}}>
      <p>{itemName}</p>
    </div>
  )
  }
}

export default ItemSelection