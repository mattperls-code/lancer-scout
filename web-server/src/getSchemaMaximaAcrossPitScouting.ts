import { JsonObject } from "@prisma/client/runtime/library";
import { prisma } from "./index";

// TODO: do this by storing information for schema separetly on creation
// TODO: the ts workarounds are super ugly in this
export async function getSchemaMaximaAcrossPitScouting(tournamentName: string) {
    console.log({ tournamentName })

    const pitScouts = await prisma.pitScout.findMany({
        where: {
            tournament: {
                title: tournamentName
            }
        }
    })

    const formsJson = pitScouts.map(pitScout => pitScout.jsonScoutInput)

    if (formsJson.length == 0) return {}

    // get all keys in the first form where the value is numeric
    // makes the assumption that all forms within a given tournament have the same schema
    const numericalFields = Object.entries(formsJson[0] as JsonObject)
        .filter(([ key, value ]) => typeof value == "number")
        .map(([ key ]) => key)
        
    const maxima: Object = {}

    // set initial maxima to those found on form used to generate numerical fields array

    numericalFields.forEach((field) => {
        (maxima as any)[field] = (formsJson[0] as JsonObject)[field]
    })

    for(let i = 1;i<formsJson.length;i++){
        numericalFields.forEach((field) => {
            if ((formsJson[i] as JsonObject)[field] as number > (maxima as any)[field]) (maxima as any)[field] = (formsJson[i] as JsonObject)[field]
        })
    }

    return maxima
}