"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fiberMaterialRepository = exports.FiberMaterialRepository = void 0;
const typeorm_1 = require("typeorm");
const data_source_1 = require("../config/data-source");
const FiberMaterial_1 = require("../entity/FiberMaterial");
class FiberMaterialRepository extends typeorm_1.Repository {
    constructor() {
        super(FiberMaterial_1.FiberMaterial, data_source_1.AppDataSource.createEntityManager());
    }
    async createMaterial(material) {
        const newMaterial = this.create(material);
        return await this.save(newMaterial);
    }
    async getAllMaterials() {
        return await this.find({
            order: {
                name: 'ASC'
            }
        });
    }
    async getMaterialById(id) {
        return await this.findOne({
            where: { id }
        });
    }
    async updateMaterial(id, material) {
        const existingMaterial = await this.findOne({
            where: { id }
        });
        if (!existingMaterial) {
            return null;
        }
        if (material.name !== undefined)
            existingMaterial.name = material.name;
        if (material.unit !== undefined)
            existingMaterial.unit = material.unit;
        if (material.cost !== undefined)
            existingMaterial.cost = material.cost;
        return await this.save(existingMaterial);
    }
    async deleteMaterial(id) {
        const materialToRemove = await this.findOne({
            where: { id }
        });
        if (!materialToRemove) {
            return null;
        }
        return await this.remove(materialToRemove);
    }
}
exports.FiberMaterialRepository = FiberMaterialRepository;
exports.fiberMaterialRepository = new FiberMaterialRepository();
