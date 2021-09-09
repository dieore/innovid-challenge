import * as React from "react";
import axios from 'axios';
import computerOn from '../assets/pc-on.gif';
import computerOff from '../assets/pc-off.png';
import styles from "./App.module.scss";

interface Server {
	id: string;
	load: number;
	isOn?: boolean;
};

const App: React.FC = () => {
	const [servers, setServers]: any[] = React.useState([]);

	const getServers = async () => {
		const serversParams: string[] = ["1", "2", "3", "4"];
		let newServers: Server[] = [];

		for (let id of serversParams) {
			let server = await axios.get("http://localhost:8000/status/id" + id);
			const checkStatus = JSON.parse(localStorage.getItem(server.data.id)!);

			let newServer = {
				id: server.data.id,
				load: checkStatus?.isOn ? server.data.load : 0,
				isOn: checkStatus ? checkStatus.isOn : server.data.load < 1 ? false : true
			};
			localStorage.setItem(server.data.id, JSON.stringify(newServer));
			newServers.push(newServer);
		};
		localStorage.setItem("servers", JSON.stringify(newServers));
		setServers(newServers);

		setTimeout(() => {
			getServers();
		}, 5000)
	};

	const handleComputerStatus = (id: string, isOn: boolean | undefined) => () => {
		const updatedServers = JSON.parse(localStorage.getItem("servers")!);

		for (let i = 0; i < updatedServers.length; i++) {
			const updatedServer = updatedServers[i];

			if (id === updatedServer.id) {
				updatedServer.isOn = !isOn;
				updatedServer.load = 0;
				localStorage.setItem(id, JSON.stringify(updatedServer));
				break;
			}
		};
		localStorage.setItem("servers", JSON.stringify(updatedServers));
		setServers(updatedServers);
	};

	React.useEffect(() => {
		getServers();
	}, [])

	return (
		<main className={styles.container}>
			{
				servers.map((s: Server, idx: string) => (
					<div key={idx} className={styles.window}>
						<div className="title-bar">
							<div className="title-bar-text">{"Server #" + s.id.substring(2)}</div>
						</div>
						<div className={styles.content}>
							<img src={s.isOn ? computerOn : computerOff} style={{ width: 160, height: 140, marginBottom: 5 }} />
							<div className={styles.downbar}>
								<div className={styles.title}>Status: {s.isOn ? "ON" : "OFF"}</div>
								<div className={styles.title} onClick={handleComputerStatus(s.id, s.isOn)}>
									<a style={{ cursor: "pointer" }}>{s.isOn ? "shut down" : "turn on"}</a>
								</div>
								<div className={styles.title}>CPU Usage: {s.load}%</div>
							</div>
						</div>
					</div>
				))
			}
		</main>
	);
};

export default App;
