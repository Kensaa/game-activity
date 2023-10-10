import Week from './pages/Week'
import SingleDay from './pages/SingleDay'
import TotalTime from './pages/TotalTime'

export default function App() {
    return (
        <div className='w-100 h-100'>
            <SingleDay />
            <Week />
            <TotalTime />
        </div>
    )
}
