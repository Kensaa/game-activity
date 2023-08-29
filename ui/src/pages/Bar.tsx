import { useState } from 'react'
import { Form, Spinner } from 'react-bootstrap'
import dataStore from '../stores/data'
import BarComponent from '../components/BarComponent'

export default function Bar() {
    const data = dataStore()
    const [numberOfDays, setNumberOfDays] = useState(7)

    if (Object.keys(data).length === 0) {
        return (
            <div className='h-100 d-flex flex-column justify-content-center align-items-center'>
                Waiting for data...
                <Spinner animation='border' />
            </div>
        )
    }
    return (
        <div className='page'>
            <div className='content'>
                <div
                    style={{ width: '80%', height: '80%' }}
                    className='d-flex flex-column align-items-center'
                >
                    <Form.Group>
                        <Form.Label>Number of displayed days : </Form.Label>
                        <Form.Control
                            type='number'
                            value={numberOfDays}
                            onChange={e =>
                                setNumberOfDays(parseInt(e.target.value))
                            }
                            min={1}
                        />
                    </Form.Group>
                    <BarComponent data={data} dayCount={numberOfDays} />
                </div>
            </div>
        </div>
    )
}
