import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/hello')({
server:{
    handlers:{
        GET:({request})=>{
            return new Response("Lol")
        },
        POST:({request})=>{
            return Response.json({hi:"hello"},{status:201})
        }
    }
}
})



