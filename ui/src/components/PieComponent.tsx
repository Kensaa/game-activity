import { useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import DoughnutLabel from 'chartjs-plugin-doughnutlabel-rebourne'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { colors, convertSecondsToString } from '../utils'
import { Spinner } from 'react-bootstrap'
ChartJS.register(ArcElement, Tooltip, Legend)

export interface PieComponentProps {
    data: Record<string, number>
}

export default function PieComponent({ data }: PieComponentProps) {
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
