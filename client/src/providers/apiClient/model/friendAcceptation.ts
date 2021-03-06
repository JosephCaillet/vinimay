/**
 * vinimay
 * Vinimay is a decentralised social network focused on giving back control of its data to the user
 *
 * OpenAPI spec version: 0.1.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

import { IdTokenDH } from './idTokenDH';


export interface FriendAcceptation {
    /**
     * The identifier of the step
     */
    step: number;

    /**
     * The temporary token used during the transaction
     */
    tempToken: string;

    idTokenDh?: IdTokenDH;

    sigTokenDh?: IdTokenDH;

    idToken?: string;

    signature?: string;

}
