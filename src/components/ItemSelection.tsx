import React, {useState, useEffect} from 'react'

type ItemSelectionProps = {
  itemName: string,
  className: string
}

const ItemSelection: React.FC<ItemSelectionProps> = (props) => {
  const { itemName, className } = props
  const [classList, setClassList] = useState('itemSelection')

  useEffect(() => {
      setClassList('itemSelection itemSelectionLoaded')
  }, [])
  
  return (
    <div className={classList}>
      <p>{itemName}</p>
    </div>
  )
}

export default ItemSelection