export const invalidParamError = <T>(message: string): T => {
    throw new Error(`invalid parameters: ${message}`);
};
