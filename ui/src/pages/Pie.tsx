import { useState, useEffect } from 'react'
import { Form, Spinner } from 'react-bootstrap'
import PieComponent from '../components/PieComponent'
import { sortDays } from '../utils'
import dataStore from '../stores/data'

export default function Pie() {
    const [selectedFile, setSelectedFile] = useState(0)
    const [fileCount, setFileCount] = useState(0)
    const data = dataStore()

    useEffect(() => {
        const newCount = Object.keys(data).length
        if (fileCount !== newCount) {
            setFileCount(newCount)
            setSelectedFile(newCount - 1)
        }
    }, [data])

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
                <Form.Group>
                    <Form.Label>Day : </Form.Label>
                    <Form.Select
                        value={selectedFile}
                        onChange={e =>
                            setSelectedFile(parseInt(e.target.value))
                        }
                    >
                        {sortDays(Object.keys(data)).map((file, i) => (
                            <option key={i} value={i}>
                                {file}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <div
                    style={{ width: '80%', height: '80%' }}
                    className='d-flex justify-content-center'
                >
                    <PieComponent
                        data={data[sortDays(Object.keys(data))[selectedFile]]}
                    />
                </div>
            </div>
        </div>
    )
}