import type { GithubUser } from '../services/github'

interface ProfileCardProps {
  user: GithubUser
}

export function ProfileCard({
  user,
}: ProfileCardProps) {
  return (
    <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#161b22] p-6 shadow-2xl">
      <div className="flex items-center gap-5">
        <img
          src={user.avatar_url}
          alt={user.name ?? user.login}
          className="h-20 w-20 rounded-full border-2 border-white/10"
        />

        <div>
          <h2 className="text-2xl font-bold text-white">
            {user.name ?? user.login}
          </h2>

          <p className="text-gray-400">
            @{user.login}
          </p>
        </div>
      </div>

      {user.bio && (
        <p className="mt-5 text-sm leading-6 text-gray-300">
          {user.bio}
        </p>
      )}

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-[#0d1117] p-4 text-center">
          <strong className="block text-xl text-white">
            {user.public_repos}
          </strong>

          <span className="text-xs text-gray-500">
            Repositórios
          </span>
        </div>

        <div className="rounded-xl bg-[#0d1117] p-4 text-center">
          <strong className="block text-xl text-white">
            {user.followers}
          </strong>

          <span className="text-xs text-gray-500">
            Seguidores
          </span>
        </div>

        <div className="rounded-xl bg-[#0d1117] p-4 text-center">
          <strong className="block text-xl text-white">
            {user.following}
          </strong>

          <span className="text-xs text-gray-500">
            Seguindo
          </span>
        </div>
      </div>
    </div>
  )
}