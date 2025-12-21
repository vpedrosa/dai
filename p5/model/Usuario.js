// ./model/Usuario.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const usuarioSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "El nombre de usuario es obligatorio"],
    unique: true,
    trim: true,
    minlength: [3, "El nombre de usuario debe tener al menos 3 caracteres"],
  },
  email: {
    type: String,
    required: [true, "El email es obligatorio"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Por favor ingrese un email válido"],
  },
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
    minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
  },
  admin: {
    type: Boolean,
    default: false,
    required: false,
  },
}, {
  timestamps: true, // Añade createdAt y updatedAt automáticamente
});

// Hook pre-save para cifrar la contraseña antes de guardar
usuarioSchema.pre("save", async function (next) {
  // Solo cifrar la contraseña si ha sido modificada (o es nueva)
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Generar salt y cifrar la contraseña
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
usuarioSchema.methods.compararPassword = async function (passwordIngresado) {
  try {
    return await bcrypt.compare(passwordIngresado, this.password);
  } catch (error) {
    throw new Error("Error al comparar contraseñas");
  }
};

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;
