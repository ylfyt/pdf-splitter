import Container from './components/container';
import { Home } from './pages';

function App() {
	return (
		<div className="App bg-gray-400 min-h-screen flex flex-col items-center">
			<Container>
				<Home />
			</Container>
		</div>
	);
}

export default App;
