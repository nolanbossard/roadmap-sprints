import { useEffect, useRef, useState } from 'react'
import Board from './components/Board'
import Editor from './components/Editor'
import { emptyProject, normalize } from './lib/model'
import { uid } from './lib/format'
import { download, loadAll, saveAll, slug } from './lib/storage'

export default function App() {
  const [projects, setProjects] = useState([])
  const [currentId, setCurrentId] = useState(null)
  const [view, setView] = useState('edit')
  const [ready, setReady] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    loadAll().then((s) => {
      const list = (s.projects || []).map(normalize)
      setProjects(list)
      setCurrentId(list.find((p) => p.id === s.currentId)?.id ?? list[0]?.id ?? null)
      setReady(true)
    })
  }, [])

  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => saveAll({ projects, currentId }), 300)
    return () => clearTimeout(t)
  }, [projects, currentId, ready])

  const project = projects.find((p) => p.id === currentId)
  const update = (next) => setProjects((list) => list.map((p) => (p.id === next.id ? { ...next, updatedAt: Date.now() } : p)))
  const add = (p) => {
    setProjects((list) => [...list, p])
    setCurrentId(p.id)
  }

  const create = () => {
    add(emptyProject())
    setView('edit')
  }
  const duplicate = () => add({ ...structuredClone(project), id: uid(), name: `${project.name} (copie)` })
  const remove = () => {
    if (!confirm(`Supprimer « ${project.name} » ? Pensez à l’exporter avant si besoin.`)) return
    const rest = projects.filter((p) => p.id !== project.id)
    setProjects(rest)
    setCurrentId(rest[0]?.id ?? null)
  }
  const importFile = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try {
      const data = JSON.parse(await f.text())
      if (!data || !Array.isArray(data.sprints)) throw new Error()
      add({ ...normalize(data), id: uid() })
    } catch {
      alert('Ce fichier n’est pas un projet exporté depuis cet outil.')
    }
  }

  if (!ready) return null

  return (
    <div className="min-h-screen">
      <header className="no-print sticky top-0 z-10 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[2600px] flex-wrap items-center gap-2 px-5 py-2.5">
          <span className="mr-2 font-semibold">Roadmap</span>
          {projects.length > 0 && (
            <select className="field w-auto max-w-[240px] py-1" aria-label="Projet" value={currentId ?? ''} onChange={(e) => setCurrentId(e.target.value)}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || 'Sans nom'}
                </option>
              ))}
            </select>
          )}
          <button className="btn" onClick={create}>
            Nouveau
          </button>
          {project && (
            <>
              <button className="btn" onClick={duplicate}>
                Dupliquer
              </button>
              <button className="btn" onClick={() => download(`${slug(project.name)}.json`, JSON.stringify(project, null, 2))}>
                Exporter
              </button>
            </>
          )}
          <button className="btn" onClick={() => fileRef.current?.click()}>
            Importer
          </button>
          {project && (
            <button className="btn text-muted hover:text-accent" onClick={remove}>
              Supprimer
            </button>
          )}
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={importFile} />

          {project && (
            <div className="ml-auto flex items-center gap-2">
              {view === 'board' && (
                <button className="btn" onClick={() => window.print()}>
                  Imprimer en PDF
                </button>
              )}
              <div className="flex rounded-md bg-paper p-0.5 text-sm" role="tablist">
                {[
                  ['edit', 'Édition'],
                  ['board', 'Rendu'],
                ].map(([k, l]) => (
                  <button
                    key={k}
                    role="tab"
                    aria-selected={view === k}
                    className={`rounded px-3 py-1 font-medium ${view === k ? 'bg-white shadow-sm' : 'text-muted'}`}
                    onClick={() => setView(k)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {!project ? (
        <div className="mx-auto max-w-md px-5 py-32 text-center">
          <h1 className="text-2xl font-semibold">Aucune roadmap</h1>
          <p className="mt-2 text-muted">Créez un projet, ajoutez l’équipe et les sprints : le rendu se construit tout seul.</p>
          <div className="mt-6 flex justify-center gap-2">
            <button className="btn-main" onClick={create}>
              Créer un projet
            </button>
            <button className="btn" onClick={() => fileRef.current?.click()}>
              Importer un JSON
            </button>
          </div>
        </div>
      ) : view === 'edit' ? (
        <Editor project={project} onChange={update} />
      ) : (
        <Board project={project} />
      )}
    </div>
  )
}
