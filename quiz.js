const { useState, useEffect } = React;

function QuizGeo() {
  const [nomeJog, setNomeJog] = useState("");
  const [iniciado, setIniciado] = useState(false);
  const [fase, setFase] = useState("Novato");
  const [atual, setAtual] = useState(0);
  const [pontos, setPontos] = useState(0);
  const [curios, setCurios] = useState("");
  const [ranking, setRanking] = useState([]);
  const [respondido, setRespondido] = useState(false);
  const [acertou, setAcertou] = useState(null);
  const [completoSemErros, setCompletoSemErros] = useState(false); // flag parabéns

  const questoesAtuais = questoes[fase];

  const carregarCurios = () => {
    fetch(
      `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        questoesAtuais[atual].wiki
      )}`
    )
      .then(r => r.json())
      .then(d => setCurios(d.extract))
      .catch(() => setCurios("Curiosidade não encontrada."));
  };

  useEffect(() => {
    const salvo = JSON.parse(localStorage.getItem("rankingGeo") || "[]");
    const rankingValido = salvo.filter(r => r.nome && typeof r.pontos === "number");
    setRanking(rankingValido);
  }, []);

  const verificarResp = (opc) => {
    setRespondido(true);
    carregarCurios();
    if (opc === questoesAtuais[atual].resp) {
      setAcertou(true);
      setPontos(pontos + 1);
    } else {
      setAcertou(false);
    }
  };

  const proxQuestao = () => {
    if (acertou) {
      if (atual + 1 < questoesAtuais.length) {
        setAtual(atual + 1);
        setRespondido(false);
        setCurios("");
      } else if (fase === "Novato") {
        setFase("Experiente"); setAtual(0); setRespondido(false); setCurios("");
      } else if (fase === "Experiente") {
        setFase("Mestre"); setAtual(0); setRespondido(false); setCurios("");
      } else if (fase === "Mestre") {
        // completou todas as fases sem erros
        setCompletoSemErros(true);
      }
    } else fimQuiz();
  };

  const fimQuiz = () => {
    const novoRank = [...ranking, { nome: nomeJog, pontos }];
    novoRank.sort((a, b) => b.pontos - a.pontos);
    localStorage.setItem("rankingGeo", JSON.stringify(novoRank));
    setRanking(novoRank);
    setIniciado(false); setFase("Novato"); setAtual(0); setPontos(0);
    setRespondido(false); setCurios(""); setCompletoSemErros(false);
    salvarRankingGeografia(nomeJog, pontos);
  };

  if (completoSemErros) {
    return React.createElement("div", { className: "container" },
      React.createElement("h1", null, "🎉 Parabéns! Você completou todas as fases sem erros! 🎉"),
      React.createElement("button", { onClick: fimQuiz }, "Voltar ao início")
    );
  }

  if (!iniciado) {
    return React.createElement("div", { className: "container" }, 
      React.createElement("h1", null, "Quiz de Geografia"),
      React.createElement("input", { placeholder: "Digite seu nome", value: nomeJog, onChange: e => setNomeJog(e.target.value) }),
      React.createElement("button", { onClick: () => nomeJog && setIniciado(true) }, "Iniciar Quiz"),
      React.createElement("h2", null, "Ranking"),
      ranking.length === 0
        ? React.createElement("p", null, "Nenhum jogador ainda")
        : React.createElement("ul", null, ranking.map((r, i) => 
            React.createElement("li", { key: i }, `${i+1}. ${r.nome} - ${r.pontos} pts`)
          ))
    );
  }

  const q = questoesAtuais[atual];

  return React.createElement("div", { className: "container" },
    React.createElement("h2", null, `Fase: ${fase}`),
    React.createElement("p", null, q.perg),
    React.createElement("div", null,
      q.opcs.map((opc, i) => React.createElement("button", { key: i, onClick: () => !respondido && verificarResp(opc) }, opc))
    ),
    respondido && React.createElement("div", null,
      React.createElement("p", null, acertou ? "✅ Correto!" : "❌ Incorreto!"),
      React.createElement("p", null, "Curiosidade: ", curios),
      React.createElement("button", { onClick: proxQuestao }, acertou ? "Próxima" : "Finalizar")
    )
  );
}

ReactDOM.createRoot(document.getElementById("raiz")).render(React.createElement(QuizGeo));

const pool = require('./db'); 

async function salvarRankingGeografia(nome, pontuacao) {
  try {
    await fetch('http://localhost:3000/ranking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, pontuacao })
    });

    const response = await fetch('http://localhost:3000/ranking');
    const dados = await response.json();
    setRanking(dados);
  } catch (err) {
    console.error('Erro ao salvar ranking:', err);
  }
}

