/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureTreeDataProvider, IAzureNode, IAzureParentNode } from "vscode-azureextensionui";
import { ICosmosEditor } from "../../CosmosEditorManager";
import { MongoDatabaseTreeItem } from "../tree/MongoDatabaseTreeItem";
import { IMongoDocument, MongoDocumentTreeItem } from "../tree/MongoDocumentTreeItem";
// tslint:disable:no-var-requires
const EJSON = require("mongodb-extended-json");

export class MongoFindOneResultEditor implements ICosmosEditor<IMongoDocument> {
    private _databaseNode: IAzureParentNode<MongoDatabaseTreeItem>;
    private _collectionName: string;
    private _originalDocument: IMongoDocument;
    private _tree: AzureTreeDataProvider;

    constructor(databaseNode: IAzureParentNode<MongoDatabaseTreeItem>, collectionName: string, data: string, tree: AzureTreeDataProvider) {
        this._databaseNode = databaseNode;
        this._collectionName = collectionName;
        this._originalDocument = EJSON.parse(data);
        this._tree = tree;
    }

    public get label(): string {
        const accountNode = this._databaseNode.parent;
        return `${accountNode.treeItem.label}/${this._databaseNode.treeItem.label}/${this._collectionName}/${this._originalDocument._id}`;
    }

    public async getData(): Promise<IMongoDocument> {
        return this._originalDocument;
    }

    public async update(newDocument: IMongoDocument): Promise<IMongoDocument> {
        const node = await this._tree.findNode(this.id);
        let result: IMongoDocument;
        if (node) {
            result = await (<IAzureNode<MongoDocumentTreeItem>>node).treeItem.update(newDocument);
            node.refresh();
        } else {
            // If the node isn't cached already, just update it to Mongo directly (without worrying about updating the tree)
            const db = await this._databaseNode.treeItem.getDb();
            result = await MongoDocumentTreeItem.update(db.collection(this._collectionName), newDocument);
        }
        return result;
    }

    public get id(): string {
        return `${this._databaseNode.id}/${this._collectionName}/${this._originalDocument._id.toString()}`;
    }

    public convertFromString(data: string): IMongoDocument {
        return EJSON.parse(data);
    }

    public convertToString(data: IMongoDocument): string {
        return EJSON.stringify(data, null, 2);
    }

}
