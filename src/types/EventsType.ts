export default interface Events {
    type: string | undefined,
    date: number | undefined,
    infos: {
        city: string | undefined,
        district: string | undefined,
        adress: string | undefined,
        reference: string | undefined,
        name: string | undefined,
    },
}