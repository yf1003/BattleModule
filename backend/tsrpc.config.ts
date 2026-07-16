import { TsrpcConfig } from 'tsrpc-cli';

const tsrpcConfig: TsrpcConfig = {
    proto: [
        {
            ptlDir: 'src/shared/protocols',
            output: 'src/shared/protocols/serviceProto.ts',
            apiDir: 'src/api',
            docDir: 'docs',
        },
    ],
    sync: [
        {
            from: 'src/shared',
            to: '../front/assets/Scripts/Share',
            type: 'copy',
            clean: false,
            readonly: false,
        },
    ],
    dev: {
        autoProto: true,
        autoSync: true,
        autoApi: true,
        watch: 'src',
        entry: 'src/index.ts',
    },
    build: {
        autoProto: true,
        autoSync: true,
        autoApi: true,
        outDir: 'dist',
    },
};

export default tsrpcConfig;
