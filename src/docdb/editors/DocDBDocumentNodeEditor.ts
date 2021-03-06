/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { RetrievedDocument } from "documentdb";
import { IAzureNode } from "vscode-azureextensionui";
import { ICosmosEditor } from "../../CosmosEditorManager";
import { getNodeEditorLabel } from '../../utils/vscodeUtils';
import { DocDBDocumentTreeItem } from "../tree/DocDBDocumentTreeItem";

export class DocDBDocumentNodeEditor implements ICosmosEditor<RetrievedDocument> {
    private _documentNode: IAzureNode<DocDBDocumentTreeItem>;
    constructor(documentNode: IAzureNode<DocDBDocumentTreeItem>) {
        this._documentNode = documentNode;
    }

    public get label(): string {
        return getNodeEditorLabel(this._documentNode);
    }

    public async getData(): Promise<RetrievedDocument> {
        return this._documentNode.treeItem.document;
    }

    public async update(document: RetrievedDocument): Promise<RetrievedDocument> {
        const updatedDoc = await this._documentNode.treeItem.update(document);
        await this._documentNode.refresh();
        return updatedDoc;
    }

    public get id(): string {
        return this._documentNode.id;
    }

    public convertFromString(data: string): RetrievedDocument {
        return JSON.parse(data);
    }

    public convertToString(data: RetrievedDocument): string {
        return JSON.stringify(data, null, 2);
    }

}
