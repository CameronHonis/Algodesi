import React from 'react'

type ItemSelectionProps = {
  itemName: string,
}

const ItemSelection: React.FC<ItemSelectionProps> = (props) => {
  const { itemName } = props

  return (
    <div className='itemSelection' id={itemName}>
      <p>{itemName}</p>
    </div>
  )
}

export default ItemSelection