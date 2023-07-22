import { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import { useInterval } from 'usehooks-ts'
import PieComponent from '../components/PieComponent'

export default function Piepage() {
    const [files, setFiles] = useState<string[]>([])
    const [data, setData] = useState<Record<string, number>>({})
    const [selectedFile, setSelectedFile] = useState(0)
    const address =
        import.meta.env.MODE == 'production' ? '' : 'http://localhost:49072'
    useEffect(() => {
        fetch(`${address}/files`)
            .then(res => res.json())
            .then(files => setFiles(files))
    }, [])

    useEffect(() => {
        setSelectedFile(files.length - 1)
    }, [files])

    useInterval(() => {
        if (!files) return
        fetch(`${address}/file/${files[selectedFile]}`)
            .then(res => res.json())
            .then(data => setData(data))
    }, 1000)

    /*console.log(
      Object.keys(data).map(
        (key) => `${key} : ${convertSecondsToString(data[key])}`
      )
    );*/

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
                        {files.map((file, i) => (
                            <option key={i} value={i}>
                                {file.split('-').join('/')}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <div
                    style={{ width: '80%', height: '80%' }}
                    className='d-flex justify-content-center'
                >
                    <PieComponent data={data} />
                </div>
            </div>
        </div>
    )
}
