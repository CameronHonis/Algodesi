import React from 'react'

type ItemSelectionProps = {
  itemName: string,
  className: string
}

const ItemSelection: React.FC<ItemSelectionProps> = (props) => {
  const { itemName } = props

  return (
    <div className='itemSelection'>
      <p>{itemName}</p>
    </div>
  )
}

export default ItemSelection