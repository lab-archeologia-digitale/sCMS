import React, { useState } from "react"

import { Row, Col, Form, Button } from "react-bootstrap"
import defaultOperators from "./defaultOperators"
import { plain2directus, plain2maplibre } from "./transformers"

const SearchUI = ({ fieldList, operators, connector }) => {
  operators = Object.assign(defaultOperators, operators)
  connector = {
    _and: connector?._and || "AND",
    _or: connector?._or || "OR",
  }

  const [inputs, setInputs] = useState([
    {
      field: Object.keys(fieldList)[0],
      operator: Object.keys(operators)[0],
      value: "",
    },
  ])

  const [conn, setConn] = useState("_and")

  const handleAddInput = () => {
    setInputs([
      ...inputs,
      {
        field: Object.keys(fieldList)[0],
        operator: Object.keys(operators)[0],
        value: "",
      },
    ])
  }

  const handleChange = (event, index) => {
    let { name, value } = event.target
    let onChangeValue = [...inputs]
    onChangeValue[index][name] = value
    setInputs(onChangeValue)
  }

  const handleDeleteInput = index => {
    const newArray = [...inputs]
    newArray.splice(index, 1)
    setInputs(newArray)
  }

  const handleSend = () => {
    console.log(plain2directus(conn, inputs))
  }

  return (
    <React.Fragment>
      {inputs.length > 1 && (
        <React.Fragment>
          {Object.entries(connector).map(([k, v], i) => (
            <Form.Check
              key={k}
              inline
              type="radio"
              name="connector"
              value={k}
              label={v}
              checked={k === conn}
              onChange={event => setConn(k)}
            />
          ))}
        </React.Fragment>
      )}
      {inputs.map((item, index) => (
        <Row key={index} className="my-2">
          <Col sm>
            <Form.Select
              aria-label="Select field"
              name="field"
              value={item.field}
              onChange={event => handleChange(event, index)}
            >
              {Object.entries(fieldList).map(([k, v], i) => (
                <option key={i} value={v}>
                  {v}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col sm>
            <Form.Select
              aria-label="Operator"
              name="operator"
              value={item.operator}
              onChange={event => handleChange(event, index)}
            >
              {Object.entries(operators).map(([k, v], i) => (
                <option value={k} key={i}>
                  {v}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col sm>
            <Form.Control
              type="input"
              name="value"
              value={item.value}
              onChange={event => handleChange(event, index)}
            />
          </Col>
          <Col sm>
            {index > 0 && (
              <Button
                variant="danger"
                onClick={() => handleDeleteInput(index)}
                className="mx-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-trash3"
                  viewBox="0 0 16 16"
                >
                  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                </svg>
              </Button>
            )}
            {index === inputs.length - 1 && (
              <React.Fragment>
                <Button
                  variant="info"
                  className="mx-1"
                  onClick={() => handleAddInput()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-plus-circle-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
                  </svg>
                </Button>
                <Button
                  onClick={() => handleSend()}
                  variant="success"
                  className="mx-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-send"
                    viewBox="0 0 16 16"
                  >
                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
                  </svg>
                </Button>
              </React.Fragment>
            )}
          </Col>
        </Row>
      ))}
      <Row className="row border m-3 shadow p-3">
        <Col>
          <p className="border mb-3 shadow p-2">Raw output</p>
          <pre>
            <code language="js">
              {JSON.stringify({ conn: conn, filters: inputs }, null, 2)}
            </code>
          </pre>
        </Col>
        <Col>
        <p className="border mb-3 shadow p-2">Output ransformed to Directus API syntax:</p>
          <pre>
            <code language="js">
              {JSON.stringify(plain2directus(conn, inputs), null, 2)}
            </code>
          </pre>
        </Col>
        <Col>
        <p className="border mb-3 shadow p-2">Output ransformed to MapLibre Expression syntax:</p>
          <pre>
            <code language="js">
              {JSON.stringify(plain2maplibre(conn, inputs), null, 2)}
            </code>
          </pre>
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default SearchUI
