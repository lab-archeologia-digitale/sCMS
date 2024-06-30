import React, { useState } from "react"

const ControlPanel = ({
  baseLayers,
  selectedLayer,
  onLayerChange,
  sourceLayers,
}) => {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => {
    setIsVisible(!isVisible)
  }
  return (
    <div className={`control-panel ${isVisible ? "visible" : "hidden"}`}>
      <button className="toggle-button" onClick={toggleVisibility}>
        {isVisible ? "Hide" : "Show"} Layers
      </button>
      {isVisible && (
        <div className="layer-controls">
          <h3>Base Layers</h3>
          {Object.keys(baseLayers).map(key => (
            <div key={key}>
              <input
                type="checkbox"
                id={key}
                checked={selectedLayer === baseLayers[key].url}
                onChange={() => onLayerChange(baseLayers[key].url)}
              />
              <label htmlFor={key}>{baseLayers[key].name}</label>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
export default ControlPanel
