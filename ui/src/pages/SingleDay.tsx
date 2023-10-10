import { useState, useEffect, useMemo } from 'react'
import { Form, Spinner } from 'react-bootstrap'
import dataStore from '../stores/data'
import { Doughnut } from 'react-chartjs-2'
import DoughnutLabel from 'chartjs-plugin-doughnutlabel-rebourne'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { sortDays, colors, convertSecondsToString } from '../utils'
ChartJS.register(ArcElement, Tooltip, Legend)

export default function SingleDay() {
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

export interface PieComponentProps {
    data: Record<string, number>
}

function PieComponent({ data }: PieComponentProps) {
    if (data === undefined) {
        return (
            <div className='h-100 d-flex justify-content-center align-items-center'>
                <Spinner animation='border' />
            </div>
        )
    }

    const pieData = useMemo(() => {
        const days = Object.keys(data)
        return {
            labels: days,
            datasets: [
                {
                    label: 'test',
                    data: days.map(e => data[e]),
                    backgroundColor: colors
                }
            ]
        }
    }, [data])

    const total = () => {
        //if (Object.keys(data).length === 0) return c;
        return convertSecondsToString(
            Object.values(data).reduce((p, e) => p + e, 0)
        )
    }

    return (
        <Doughnut
            data={pieData}
            //@ts-ignore
            plugins={[DoughnutLabel]}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: item => {
                                return convertSecondsToString(
                                    item.raw as number
                                )
                            }
                        }
                    },
                    //@ts-ignore
                    doughnutlabel: {
                        //paddingPercentage: 5,
                        labels: [
                            {
                                text: 'Total :',
                                font: {
                                    size: '28',
                                    family: 'Arial, Helvetica, sans-serif',
                                    weight: 'bold'
                                }
                            },
                            {
                                text: total,
                                font: {
                                    size: '20',
                                    family: 'Arial, Helvetica, sans-serif'
                                }
                            }
                        ]
                    }
                }
            }}
        />
    )
}
