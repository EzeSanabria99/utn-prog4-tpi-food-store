from typing import Generic, TypeVar, Type, Optional, List
from sqlmodel import SQLModel, Session, select

T = TypeVar("T", bound=SQLModel)

class BaseRepository(Generic[T]):
    def __init__(self, session: Session, model_cls: Type[T]):
        self.session = session
        self.model_cls = model_cls

    def create(self, entity: T) -> T:
        self.session.add(entity)
        self.session.flush()
        return entity

    def get_by_id(self, entity_id: int) -> Optional[T]:
        return self.session.get(self.model_cls, entity_id)

    def get_all(self) -> List[T]:
        return self.session.exec(select(self.model_cls)).all()
