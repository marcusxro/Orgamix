// src/@types/tensorflow-models.d.ts
declare module '@tensorflow-models/toxicity' {
    import { Model } from '@tensorflow/tfjs';

    export interface PredictionResult {
        label: string;
        results: Array<{
            match: boolean;
            probabilities: number[];
        }>;
    }

    export function load(threshold?: number): Promise<Model>;
}
