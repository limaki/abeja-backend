const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          ok: false,
          message: 'No autorizado'
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          ok: false,
          message: 'No tenés permisos para acceder a este recurso'
        });
      }

      next();
    } catch (error) {
      console.error('Error en roleMiddleware:', error);
      return res.status(500).json({
        ok: false,
        message: 'Error interno al validar rol'
      });
    }
  };
};

module.exports = roleMiddleware;