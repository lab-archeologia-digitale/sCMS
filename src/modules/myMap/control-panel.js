import React, { useState } from "react"
import styled from "styled-components"


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
    <StyledControl className={`control-panel ${isVisible ? "visible" : "hidden"} border shadow rounded`}  onMouseEnter={toggleVisibility} onMouseLeave={toggleVisibility}>
      <div className="text-end">
      {!isVisible && 
      <button className="btn btn-light btn-sm" >
        <img 
          style={{width: '25px'}} 
          alt="Show layers"
          src="data:image/svg+xml,%3Csvg%20width%3D%22800px%22%20height%3D%22800px%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7.62442%204.4489C9.50121%203.69796%2010.6208%203.25%2012%203.25C13.3792%203.25%2014.4988%203.69796%2016.3756%204.4489L19.3451%205.6367C20.2996%206.01851%2021.0728%206.32776%2021.6035%206.60601C21.8721%206.74683%2022.1323%206.90648%2022.333%207.09894C22.5392%207.29668%2022.75%207.59658%2022.75%208C22.75%208.40342%2022.5392%208.70332%2022.333%208.90106C22.1323%209.09352%2021.8721%209.25317%2021.6035%209.39399C21.0728%209.67223%2020.2996%209.98148%2019.3451%2010.3633L16.3756%2011.5511C14.4988%2012.302%2013.3792%2012.75%2012%2012.75C10.6208%2012.75%209.50121%2012.302%207.62443%2011.5511L4.65495%2010.3633C3.70037%209.98149%202.9272%209.67223%202.39647%209.39399C2.12786%209.25317%201.86765%209.09352%201.66701%208.90106C1.46085%208.70332%201.25%208.40342%201.25%208C1.25%207.59658%201.46085%207.29668%201.66701%207.09894C1.86765%206.90648%202.12786%206.74683%202.39647%206.60601C2.92721%206.32776%203.70037%206.01851%204.65496%205.63669L7.62442%204.4489Z%22%20fill%3D%22%231C274C%22%2F%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M2.50053%2011.4415C2.50053%2011.4415%202.50053%2011.4415%202.50053%2011.4415L2.49913%2011.4402L2.50261%2011.4432C2.50702%2011.4471%202.51522%2011.4541%202.52722%2011.4641C2.55123%2011.4842%202.59042%2011.5161%202.64479%2011.5581C2.75354%2011.6422%202.92289%2011.7663%203.1528%2011.9154C3.61265%2012.2136%204.31419%2012.6115%205.25737%2012.9887L8.06584%2014.1121C10.0907%2014.922%2010.9396%2015.25%2012%2015.25C13.0604%2015.25%2013.9093%2014.922%2015.9342%2014.1121L18.7426%2012.9887C19.6858%2012.6115%2020.3874%2012.2136%2020.8472%2011.9154C21.0771%2011.7663%2021.2465%2011.6422%2021.3552%2011.5581C21.4096%2011.5161%2021.4488%2011.4842%2021.4728%2011.4641C21.4848%2011.4541%2021.493%2011.4471%2021.4974%2011.4432L21.4995%2011.4415C21.5%2011.441%2021.5006%2011.4405%2021.5011%2011.44C21.8095%2011.1652%2022.2823%2011.1915%2022.5583%2011.4992C22.8349%2011.8075%2022.8092%2012.2817%2022.5008%2012.5583L22%2012C22.5008%2012.5583%2022.501%2012.5581%2022.5008%2012.5583L22.4994%2012.5595L22.4977%2012.5611L22.493%2012.5652L22.4793%2012.5772C22.4682%2012.5868%2022.4532%2012.5997%2022.4341%2012.6155C22.3961%2012.6473%2022.3422%2012.6911%2022.2724%2012.745C22.1329%2012.8528%2021.9299%2013.001%2021.6634%2013.1739C21.1303%2013.5196%2020.3424%2013.9644%2019.2997%2014.3814L16.4912%2015.5048C16.4524%2015.5204%2016.4138%2015.5358%2016.3756%2015.5511C14.4988%2016.302%2013.3792%2016.75%2012%2016.75C10.6208%2016.75%209.50121%2016.302%207.62442%2015.5511C7.58619%2015.5358%207.54763%2015.5204%207.50875%2015.5048L4.70029%2014.3814C3.65759%2013.9644%202.86971%2013.5196%202.33662%2013.1739C2.07005%2013.001%201.86705%2012.8528%201.72757%2012.745C1.65782%2012.6911%201.60392%2012.6473%201.56587%2012.6155C1.54684%2012.5997%201.53177%2012.5868%201.52066%2012.5772L1.50696%2012.5652L1.50233%2012.5611L1.50057%2012.5595L1.4995%2012.5586C1.49934%2012.5584%201.49919%2012.5583%202%2012L1.4995%2012.5586C1.19116%2012.282%201.16512%2011.8075%201.44171%2011.4992C1.71775%2011.1915%202.19075%2011.1654%202.49913%2011.4402M2.50053%2011.4415C2.50053%2011.4415%202.50053%2011.4415%202.50053%2011.4415V11.4415ZM2.49896%2015.4401C2.19058%2015.1652%201.71775%2015.1915%201.44171%2015.4992L2.49896%2015.4401ZM2.49896%2015.4401L2.50261%2015.4432C2.50702%2015.4471%202.51522%2015.4541%202.52722%2015.4641C2.55123%2015.4842%202.59042%2015.5161%202.64479%2015.5581C2.75354%2015.6422%202.92289%2015.7663%203.1528%2015.9154C3.61265%2016.2136%204.31419%2016.6114%205.25737%2016.9887L8.06584%2018.1121C10.0907%2018.922%2010.9396%2019.25%2012%2019.25C13.0604%2019.25%2013.9093%2018.922%2015.9342%2018.1121L18.7426%2016.9887C19.6858%2016.6114%2020.3874%2016.2136%2020.8472%2015.9154C21.0771%2015.7663%2021.2465%2015.6422%2021.3552%2015.5581C21.4096%2015.5161%2021.4488%2015.4842%2021.4728%2015.4641C21.4848%2015.4541%2021.493%2015.4471%2021.4974%2015.4432L21.4995%2015.4415C21.5%2015.441%2021.5006%2015.4405%2021.5011%2015.44C21.8095%2015.1652%2022.2823%2015.1915%2022.5583%2015.4992C22.8349%2015.8075%2022.8092%2016.2817%2022.5008%2016.5583L22.0166%2016.0185C22.5008%2016.5583%2022.501%2016.5581%2022.5008%2016.5583L22.4994%2016.5595L22.4977%2016.5611L22.493%2016.5652L22.4793%2016.5772C22.4682%2016.5868%2022.4532%2016.5997%2022.4341%2016.6155C22.3961%2016.6473%2022.3422%2016.6911%2022.2724%2016.745C22.1329%2016.8528%2021.9299%2017.001%2021.6634%2017.1739C21.1303%2017.5196%2020.3424%2017.9644%2019.2997%2018.3814L16.4912%2019.5048C16.4524%2019.5204%2016.4138%2019.5358%2016.3756%2019.5511C14.4988%2020.302%2013.3792%2020.75%2012%2020.75C10.6208%2020.75%209.50121%2020.302%207.62443%2019.5511C7.58619%2019.5358%207.54763%2019.5204%207.50875%2019.5048L4.70029%2018.3814C3.65759%2017.9644%202.86971%2017.5196%202.33662%2017.1739C2.07005%2017.001%201.86705%2016.8528%201.72757%2016.745C1.65782%2016.6911%201.60392%2016.6473%201.56587%2016.6155C1.54684%2016.5997%201.53177%2016.5868%201.52066%2016.5772L1.50696%2016.5652L1.50233%2016.5611L1.50057%2016.5595L1.4995%2016.5586C1.49934%2016.5584%201.49919%2016.5583%202%2016L1.4995%2016.5586C1.19116%2016.282%201.16512%2015.8075%201.44171%2015.4992%22%20fill%3D%22%231C274C%22%2F%3E%3C%2Fsvg%3E" />
      </button>
      }
      </div>

      {isVisible && (
        <div className="layer-controls">
          {Object.keys(baseLayers).map(key => (
            <div key={key} className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id={key}
                checked={selectedLayer === baseLayers[key].url}
                onChange={() => onLayerChange(baseLayers[key].url)}
              />
              <label htmlFor={key} className="form-check-label">{baseLayers[key].name}</label>
            </div>
          ))}
        </div>
      )}
    </StyledControl>
  )
}

//style
const StyledControl = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    max-width: 200px;
    background: #fff;
    padding: .5rem;
    margin: .5rem;
`
export default ControlPanel
